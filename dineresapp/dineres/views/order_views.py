from rest_framework import viewsets, generics, permissions
from rest_framework.decorators import action

from dineres.models import Order
from dineres.serializers.order_serializers import OrderSerializer


class OrderViewSet(viewsets.ViewSet, generics.CreateAPIView):
    # Lay ten khach hang dung 1 lan
    # Lay order details dung 1 lan va hien thi lun dish trong order do
    queryset = Order.objects.filter(active=True).select_related().prefetch_related('customer').prefetch_related('details__dish')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    # @action(methods=["get"], detail=True, url_path='pay')
    # def pay(self, request, pk=None):
    #     order = self.get_object()


