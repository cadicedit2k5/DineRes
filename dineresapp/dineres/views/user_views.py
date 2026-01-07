from django.contrib.auth.hashers import check_password
from django.db.models import Q
from rest_framework import viewsets, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.response import Response
from yaml import serialize

from dineres.models import User, Chef, Order, Booking
from dineres.paginators import BookingPagination
from dineres.permissions import IsVerifiedChef
from dineres.serializers.booking_serializers import BookingDetailSerializer
from dineres.serializers.order_serializers import OrderSerializer
from dineres.serializers.user_serializers import UserSerializer, ChefSerializer


class UserViewSet(viewsets.ViewSet, CreateAPIView, ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['verify_chef', 'get_pending_chefs']:
            return [permissions.IsAdminUser()]
        if self.action in ['list']:
            return [IsVerifiedChef()]
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            return query.filter(Q(username__icontains=q) | Q(first_name__icontains=q)
                                | Q(last_name__icontains=q) | Q(phone__exact=q))
        return query

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def current_user(self, request):
        u = request.user
        if request.method.__eq__('GET'):
            serializer = self.serializer_class(u)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if request.method.__eq__('PATCH'):
            serializer = self.serializer_class(u, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(u).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], url_path='change-password', detail=False)
    def change_password(self, request):
        u = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not check_password(old_password, u.password):
            return Response({"message": "Mật khẩu cũ không chính xác"},
                            status=status.HTTP_400_BAD_REQUEST)

        u.set_password(new_password)
        u.save()

        return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='apply-chef', detail=False)
    def apply_chef(self, request):
        u = request.user
        bio = request.data.get('bio')
        specialty = request.data.get('specialty')
        experience = request.data.get('experience')

        if hasattr(u, 'chef'):
            if u.user_role == User.Role.CHEF and u.chef.is_verified:
                return Response({"message": "Bạn đã là đầu bếp!!!"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Đã gửi yêu cầu trở thành đầu bếp trc đó!!!"}, status=status.HTTP_400_BAD_REQUEST)

        Chef.objects.create(user=u, bio=bio, specialty=specialty, experience=experience)
        return Response({"message": "Gửi yêu cầu đăng ký đầu bếp thành công!!!"}, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='pending-chefs', detail=False)
    def get_pending_chefs(self, request):
        pending_chefs = Chef.objects.filter(is_verified=False).select_related('user')

        if not pending_chefs.exists():
            return Response({"message": "Không có yêu cầu trở thành đầu bếp nào đang chờ duyệt."}, status=status.HTTP_200_OK)

        pending_chefs_user = User.objects.filter(pk__in=pending_chefs.values_list('user__id', flat=True))
        serializer = UserSerializer(pending_chefs_user, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='verify-chef', detail=True)
    def verify_chef(self, request, pk=None):
        u = User.objects.get(pk=pk)

        try:
            chef_profile = u.chef
            if u.user_role == User.Role.CHEF and u.chef.is_verified:
                return Response({"message": "Đầu bếp đã đc duyệt truoc đó !"})

            u.user_role = User.Role.CHEF
            u.save()

            chef_profile.is_verified = True
            chef_profile.verified_by = request.user
            chef_profile.save()
            return Response({"message": "Đã duyệt tài khoản đầu bếp thành công"}, status=status.HTTP_200_OK)
        except Chef.DoesNotExist:
            return Response({"message": "Không tìm thấy đầu bếp!"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='orders', detail=False)
    def get_orders(self, request):
        user = request.user
        orders = Order.objects.filter(customer=user, active=True)
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='bookings', detail=False, permission_classes=[permissions.IsAuthenticated], pagination_class=BookingPagination)
    def get_bookings(self, request):
        user = request.user
        bookings = (
            Booking.objects
            .filter(customer=user, active=True)
            .select_related('customer')
            .prefetch_related('tables')
            .order_by('-booking_time')
        )
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = BookingDetailSerializer(page, many=True)
            return  self.get_paginated_response(serializer.data)
        serializer = BookingDetailSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
