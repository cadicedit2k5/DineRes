from django.db import transaction
from rest_framework import viewsets, generics, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from dineres.models import Order, Dish, OrderDetail, Booking, User
from dineres.serializers.order_serializers import OrderSerializer, OrderInputSerializer


class OrderViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    # Lay ten khach hang dung 1 lan
    # Lay order details dung 1 lan va hien thi lun dish trong order do
    queryset = Order.objects.filter(active=True).select_related().prefetch_related('customer').prefetch_related('details__dish')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(customer=self.request.user).order_by('-created_date');

    def create(self, request, *args, **kwargs):
        details_data = request.data.get("details")
        input_serializer = OrderInputSerializer(data=details_data, many=True)
        input_serializer.is_valid(raise_exception=True)
        items = input_serializer.validated_data

        user = request.user

        order_customer = None
        order_staff = None
        booking = None

        if user.user_role == User.Role.CUSTOMER:
            order_customer = user
        else:
            order_staff = user
            customer_id = request.data.get('customer_id')
            if customer_id:
                order_customer = User.objects.get(pk=customer_id)
        print(request.data.get('take_away'))
        if order_customer and not request.data.get('take_away'):
            booking = (Booking.objects.filter(customer=order_customer)
                       .exclude(status__in=[Booking.Status.COMPLETED, Booking.Status.CANCELLED]).first())
        try:
            # Su dung rollback de phong truong hop co loi
            with transaction.atomic():
                order = Order.objects.create(customer=order_customer, staff=order_staff, booking=booking)
                total_amount = 0

                for item in items:
                    dish = Dish.objects.get(pk=item['dish_id'])
                    if not dish.active:
                        raise serializers.ValidationError(f"Món {dish.name} đang tạm ngưng phục vụ.")

                    quantity = item['quantity']
                    price = dish.price

                    OrderDetail.objects.create(
                        order=order,
                        dish=dish,
                        quantity=quantity,
                        price_at_order=price
                    )
                    total_amount += price * quantity

                order.total_amount = total_amount
                order.save()

                output_serializer = self.serializer_class(order)
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)

        except Dish.DoesNotExist:
            return Response({"message": "Món ăn không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['patch'], detail=True, url_path='done')
    def done_order(self, pk=None):
        Order.objects.filter(pk=pk).update(status=Order.Status.DONE)


