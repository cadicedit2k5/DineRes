from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer

from dineres.models import OrderDetail, Order


class OrderDetailSerializer(ModelSerializer):
    dish_name  = CharField(source='dish.name')
    class Meta:
        model = OrderDetail
    class Meta:
        model = OrderDetail
        fields = ['dish_name', 'quantity', 'price_at_order']


class OrderSerializer(ModelSerializer):
    details = OrderDetailSerializer()
    class Meta:
        model = Order
        fields = ['id', 'created_date', 'status', 'total_amount', 'details']
