from django.http import HttpResponse
from rest_framework import viewsets, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response

from dineres.models import Category, Dish, User, Chef, Ingredient
from dineres.paginators import DishPagination
from dineres.permissions import IsChef
from dineres.serializers import CategorySerializer, DishSerializer, UserSerializer, UserUpdateSerializer, \
    IngredientSerializer


def index(request):
    return HttpResponse("Dine Res Application")

# User API
class UserViewSet(viewsets.ViewSet, CreateAPIView, ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['verify_chef']:
            return [permissions.IsAdminUser()]
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=['post'], url_path='verify-chef', detail=True)
    def verify_chef(self, request, pk=None):
        u = self.get_object()

        if u.user_role != User.Role.CHEF:
            return Response({"message": "User không phải là đầu bếp!"},status=status.HTTP_400_BAD_REQUEST)

        try:
            chef_profile = u.chef
            if chef_profile.is_verified == True:
                return Response({"message": "Đầu bếp đã đc duyệt truoc đó !"})
            chef_profile.is_verified = True
            chef_profile.verified_by = request.user
            chef_profile.save()
            return Response({"message": "Đã duyệt tài khoản đầu bếp thành công"}, status=status.HTTP_200_OK)
        except Chef.DoesNotExist:
            return Response({"message": "Không tìm thấy đầu bếp!"}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('GET'):
            return Response(UserSerializer(u).data, status=status.HTTP_200_OK)

        if request.method.__eq__('PATCH'):
            serializer = UserUpdateSerializer(u, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(u).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Ingredient API
class IngredientViewSet(viewsets.ViewSet, ListAPIView, CreateAPIView):
    queryset = Ingredient.objects.filter(active=True)
    serializer_class = IngredientSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

# Hàm lọc danh sách tham số dùng chung
def filter_dish_queryset(query, params):
    q = params.get('q')
    chef_id = params.get('chef_id')
    cate_id = params.get('cate_id')
    min_price = params.get('min_price')
    max_price = params.get('max_price')
    prep_time = params.get('prep_time')

    if q:
        query = query.filter(name__icontains=q)
    if chef_id:
        query = query.filter(chef_id=chef_id)
    if cate_id:
        query = query.filter(category_id=cate_id)
    if min_price:
        query = query.filter(price__gte=min_price)
    if max_price:
        query = query.filter(price__lte=max_price)
    if prep_time:
        query = query.filter(prep_time__lte=prep_time)

    return query

# Category API
class CategoryViewSet(viewsets.ViewSet, ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get'], url_path='dishes', detail=True)
    def get_dishes(self, request, pk=None):
        dishes = filter_dish_queryset(self.get_object().dishes.filter(active=True), request.query_params)
        paginator = DishPagination()
        page = paginator.paginate_queryset(dishes, request)

        if page is not None:
            serializer = DishSerializer(page, many=True, context={'request': request})
            return Response(paginator.get_paginated_response(serializer.data).data, status=status.HTTP_200_OK)

# Dish API
class DishViewSet(viewsets.ViewSet, ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView):
    queryset = Dish.objects.filter(active=True)
    serializer_class = DishSerializer
    parser_classes = [parsers.MultiPartParser]
    pagination_class = DishPagination

    def get_queryset(self):
        query = self.queryset
        return filter_dish_queryset(query, self.request.query_params)

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsChef()]


