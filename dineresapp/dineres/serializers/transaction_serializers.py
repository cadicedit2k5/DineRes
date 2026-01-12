from rest_framework.serializers import ModelSerializer

from dineres.models import Transaction


class TransactionSerializer(ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'payment_method', 'status', 'paid_at', 'order']