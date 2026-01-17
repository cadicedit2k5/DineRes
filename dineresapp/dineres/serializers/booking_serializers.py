from datetime import timedelta, datetime

from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from dineres.models import Table, Booking, User

class TableSerializer(ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'capacity']

class BookingSerializer(serializers.ModelSerializer):
    customer_id = serializers.IntegerField(required=False)
    table = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all(),
        write_only=True
    )

    class Meta:
        model = Booking
        fields = ['booking_time', 'note', 'table', 'customer_id']

    def validate(self, data):
        booking_time = data.get('booking_time')
        table = data.get('table')

        start = booking_time - timedelta(minutes=90)
        end = booking_time + timedelta(minutes=90)

        exists = Booking.objects.filter(
            tables=table,
            booking_time__range=(start, end),
            status__in=['pending', 'confirmed']
        ).exists()

        if exists:
            raise serializers.ValidationError("Bàn này đã được đặt.")

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        customer_id = validated_data.pop('customer_id', None)
        table = validated_data.pop('table')

        # Xác định customer giống Order
        if user.user_role == User.Role.CUSTOMER:
            customer = user
        else:
            if customer_id:
                customer = User.objects.get(pk=customer_id)
            else:
                customer = user  # nhân viên tự booking

        booking = Booking.objects.create(
            customer=customer,
            **validated_data
        )
        booking.tables.add(table)

        return booking

class BookingDetailSerializer(serializers.ModelSerializer):
    table = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'status',
            'booking_time',
            'note',
            'customer_name',
            'table'
        ]

    def get_table(self, obj):
        table = obj.tables.first()
        return TableSerializer(table).data if table else None

class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']

    def validate(self, data):
        status = data.get('status')
        allowed = [
            Booking.Status.CONFIRMED,
            Booking.Status.DINING,
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED
        ]

        if status not in allowed:
            raise serializers.ValidationError("Trạng thái không hợp lệ")

        return data



