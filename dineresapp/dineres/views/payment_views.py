import uuid

from django.contrib.admin.templatetags.admin_list import result_list
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
        redirect_url = serializer.validated_data['redirect_url']

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

                result = payment.create_payment(amount=total_amount, ref=ref, redirect_url=redirect_url)
                return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PaymentIPNViewSet(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, method):
        try:
            payment = PaymentStrategyFactory.get_strategy(method)
            data = request.data
            print("return data:" ,data)
            payment.process_payment(data)
            return Response({"return_code": 1, "return_message": "success"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"return_code": 0, "return_message": str(e)}, status=status.HTTP_200_OK)
    #
    # def get(self, request, method):
    #     try:
    #         data = request.query_params.dict()
    #         payment = PaymentStrategyFactory.get_strategy(method)
    #         payment.process_payment(data)
    #         return Response({"return_code": 1, "return_message": "success"}, status=200)
    #     except Exception as e:
    #         return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


