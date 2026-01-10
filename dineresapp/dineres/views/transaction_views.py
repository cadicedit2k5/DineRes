from rest_framework import viewsets, generics, permissions

from dineres.models import Transaction
from dineres.serializers.transaction_serializers import TransactionSerializer


class TransactionViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Transaction.objects.filter(active=True).order_by('-paid_at')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAdminUser]