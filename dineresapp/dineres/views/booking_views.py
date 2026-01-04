from datetime import timedelta

from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, generics, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

from dineres.models import Table, Booking
from dineres.paginators import TablePagination
from dineres.serializers import booking_serializers

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

class BookingView(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Booking.objects.filter(active=True)
    serializer_class = booking_serializers.BookingSerializer
    # parser_classes = [parsers.MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = serializer.save(customer=request.user)

        return Response(booking_serializers.BookingDetailSerializer(booking).data,status=status.HTTP_201_CREATED)