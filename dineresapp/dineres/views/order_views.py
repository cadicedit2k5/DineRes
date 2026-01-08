from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from dineres.models import Order
from dineres.serializers.order_serializers import OrderSerializer


class OrderViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView, generics.UpdateAPIView, RetrieveAPIView):
    # Lay ten khach hang dung 1 lan
    # Lay order details dung 1 lan va hien thi lun dish trong order do
    queryset = Order.objects.filter(active=True).select_related().select_related('customer').prefetch_related('details__dish')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['post'], detail=True, url_path='done')
    def done_order(self, request, pk=None):
        order = self.queryset.filter(pk=pk)
        order.update(status=Order.Status.DONE)
        return Response(OrderSerializer(order.first()).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='cancel')
    def cancel_order(self, request, pk=None):
        order = self.queryset.filter(pk=pk)
        order.update(status=Order.Status.CANCEL)
        return Response(OrderSerializer(order.first()).data, status=status.HTTP_200_OK)


