from datetime import timedelta

from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from dineres.models import Table, Booking

class TableSerializer(ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'capacity']

class BookingSerializer(serializers.ModelSerializer):
    table = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all()
    )

    class Meta:
        model = Booking
        fields = ['booking_time', 'note', 'table']

    def create(self, validated_data):
        table = validated_data.pop('table')
        booking = Booking.objects.create(**validated_data)
        booking.tables.add(table)
        return booking

    def validate(self, data):
        booking_time = data['booking_time']
        table = data['table']

        start = booking_time - timedelta(minutes=90)
        end = booking_time + timedelta(minutes=90)

        exists = Booking.objects.filter(
            tables=table,
            booking_time__range=(start, end),
            status__in=['pending', 'confirmed']
        ).exists()

        if exists:
            raise serializers.ValidationError(
                'Bàn này đã được đặt.'
            )

        return data

class BookingDetailSerializer(serializers.ModelSerializer):
    table = serializers.SerializerMethodField()
    customer_name = serializers.CharField(
        source='customer.get_full_name',
        read_only=True
    )

    class Meta:
        model = Booking
        fields = ['id', 'status', 'booking_time', 'note', 'customer_name', 'table']

    def get_table(self, obj):
        table = obj.tables.first()
        return TableSerializer(table).data if table else None

class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']

    def validate(self, data):
        status = data.get('status')
        allowed = ['confirmed', 'dining', 'completed', 'cancelled']
        if status not in allowed:
            raise serializers.ValidationError("Trạng thái không hợp lệ")
        return data


