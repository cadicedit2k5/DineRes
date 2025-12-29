import uuid

from django.db import transaction
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from dineres.models import Order, Transaction
from dineres.serializers.payment_serializers import CreatePaymentSerializer
from dineres.services.payment_strategy import PaymentStrategyFactory


class CreatePaymentViewSet(viewsets.ViewSet, generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreatePaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data['order_id']
        payment_method = serializer.validated_data['payment_method']

        try:
            with transaction.atomic():
                order = Order.objects.get(pk=order_id)
                total_amount = order.total_amount
                ref = uuid.uuid4()
                payment = PaymentStrategyFactory.get_strategy(payment_method)
                Transaction.objects.create(order=order,
                                           amount=total_amount,
                                           payment_method=payment_method,
                                           transaction_ref=ref)

                result = payment.create_payment(amount=total_amount, ref=ref)
                return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PaymentIPNViewSet(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, method):
        try:
            payment = PaymentStrategyFactory.get_strategy(method)
            data = request.data
            payment.process_payment(data)
            return Response(
                {
                    "message": "Giao dịch đã được ghi nhận.",
                    "data": data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, method):
        data = request.query_params.dict()
        payment = PaymentStrategyFactory.get_strategy(method)
        payment.process_payment(data)
        return Response(
            {
                "message": "Giao dịch đã được ghi nhận.",
                "data": data
            },
            status=status.HTTP_200_OK
        )
        # try:
        #
        # except Exception as e:
        #     return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


