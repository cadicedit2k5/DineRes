from datetime import timedelta

from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from dineres.models import Table, Booking
from dineres.paginators import TablePagination, BookingPagination
from dineres.permissions import IsEmployee
from dineres.serializers import booking_serializers
from dineres.serializers.booking_serializers import BookingDetailSerializer, BookingStatusSerializer, BookingSerializer


class TableViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Table.objects.filter(active=True)
    serializer_class = booking_serializers.TableSerializer
    pagination_class = TablePagination

    def get_queryset(self):
        qs = self.queryset
        booking_time = self.request.query_params.get('booking_time')

        if booking_time:
            booking_time = parse_datetime(booking_time)

            if booking_time:
                start = booking_time - timedelta(minutes=90)
                end = booking_time + timedelta(minutes=90)

                qs = qs.exclude(
                    bookings__booking_time__range=(start, end),
                    bookings__status__in=['pending', 'confirmed']
                )

        return qs.distinct()

class BookingView(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Booking.objects.filter(active=True)
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = BookingPagination

    def get_queryset(self):
        return (
            self.queryset
            .select_related('customer')
            .prefetch_related('tables')
            .order_by('-booking_time')
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        booking = serializer.save()

        return Response(BookingDetailSerializer(booking).data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = BookingDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BookingDetailSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=True, url_path='update-status', permission_classes=[IsEmployee])
    def update_status(self, request, pk=None):
        booking = self.get_object()

        serializer = BookingStatusSerializer(
            booking,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(BookingDetailSerializer(booking).data, status=status.HTTP_200_OK)
