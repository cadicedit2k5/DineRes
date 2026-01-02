from rest_framework import viewsets, generics, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

from dineres.models import Table, Booking
from dineres.serializers import booking_serializers

class TableViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Table.objects.filter(active=True)
    serializer_class = booking_serializers.TableSerializer

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