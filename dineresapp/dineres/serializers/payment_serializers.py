from rest_framework import serializers

from dineres.models import Transaction, Order


class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Transaction.Method.choices)
    redirect_url = serializers.CharField(required=False)

    def validate_order_id(self, value):
        try:
            order = Order.objects.get(pk=value)
            if order.status == Order.Status.PAID:
                raise serializers.ValidationError({"Đơn hàng đã được thanh toán."})
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError({"Đơn hàng không tồn tại."})