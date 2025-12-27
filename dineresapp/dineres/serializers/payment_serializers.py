from rest_framework import serializers

from dineres.models import Transaction, Order


class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Transaction.Method.choices)

    def validate_order_id(self, value):
        try:
            order = Order.objects.get(pk=value)
            if order.status != Order.Status.PENDING:
                raise serializers.ValidationError({"Đơn hàng đã được thanh toán."})
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError({"Đơn hàng đã được thanh toán."})