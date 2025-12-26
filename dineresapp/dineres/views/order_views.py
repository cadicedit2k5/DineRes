from rest_framework import viewsets

from dineres.models import Order
from dineres.serializers.order_serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.filter(active=True)
    serializer_class = OrderSerializer
