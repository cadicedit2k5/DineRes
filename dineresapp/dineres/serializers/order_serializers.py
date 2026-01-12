from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer

from dineres.models import OrderDetail, Order, User, Booking, Dish


class OrderInputSerializer(serializers.Serializer):
    dish_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class OrderDetailSerializer(ModelSerializer):
    dish_id = CharField(source='dish.id', read_only=True)
    name  = CharField(source='dish.name', read_only=True)
    image = CharField(source='dish.image.url', read_only=True)
    class Meta:
        model = OrderDetail
        fields = ['dish_id', 'name', 'image', 'quantity', 'price_at_order']

class OrderSerializer(ModelSerializer):
    details = OrderInputSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'created_date', 'status', 'total_amount', 'details']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['details'] = OrderDetailSerializer(instance.details.all(), many=True).data

        return data

    def create(self, validated_data):
        details_data = validated_data.pop("details", None)
        customer_id = validated_data.pop('customer_id', None)
        take_away = validated_data.pop('take_away', False)

        request = self.context.get('request')
        user = request.user

        order_customer = None
        order_staff = None
        booking = None

        if user.user_role == User.Role.CUSTOMER:
            order_customer = user
        else:
            order_staff = user
            if customer_id:
                order_customer = User.objects.get(pk=customer_id)
        if order_customer and not take_away:
            booking = (Booking.objects.filter(customer=order_customer)
                       .exclude(status__in=[Booking.Status.COMPLETED, Booking.Status.CANCELLED]))
            if not booking.exists():
                raise ValidationError({"message": "Đặt bàn trước khi Gọi món"})
            booking = booking.first()

        # Su dung rollback de phong truong hop co loi
        with transaction.atomic():
            order = Order.objects.create(customer=order_customer, staff=order_staff, booking=booking)
            total_amount = 0

            for item in details_data:
                dish = Dish.objects.get(pk=item['dish_id'])
                if not dish.active:
                    raise serializers.ValidationError(f"Món {dish.name} đang tạm ngưng phục vụ.")

                quantity = item['quantity']
                price = dish.price

                OrderDetail.objects.create(
                    order=order,
                    dish=dish,
                    quantity=quantity,
                    price_at_order=price
                )
                total_amount += price * quantity

            order.total_amount = total_amount
            order.save()

        return order
    def update(self, instance, validated_data):
        details_data = validated_data.pop('details', None)

        if details_data:
            with transaction.atomic():
                total_amount = 0

                for item in details_data:
                    quantity = item['quantity']
                    detail = OrderDetail.objects.filter(order=instance.id, dish_id=item['dish_id'])
                    detail.update(quantity=quantity)
                    total_amount += quantity * detail.first().price_at_order
                instance.total_amount = total_amount
                instance.save()

        return instance