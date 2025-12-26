from rest_framework import serializers
from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer

from dineres.models import OrderDetail, Order, Transaction


class OrderDetailSerializer(ModelSerializer):
    dish_name  = CharField(source='dish.name')
    class Meta:
        model = OrderDetail
    class Meta:
        model = OrderDetail
        fields = ['dish_name', 'quantity', 'price_at_order']

class OrderSerializer(ModelSerializer):
    details = OrderDetailSerializer(many=True)
    class Meta:
        model = Order
        fields = ['id', 'created_date', 'status', 'total_amount', 'details']

class PaymentSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Transaction.Method.choices)
    transaction_ref = serializers.CharField(max_length=255, required=False, allow_blank=True)