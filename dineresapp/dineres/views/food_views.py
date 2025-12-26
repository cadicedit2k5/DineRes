from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as rest_filters
from rest_framework import viewsets, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.response import Response

from dineres.filters import DishFilter
from dineres.models import Ingredient, Category, Dish
from dineres.paginators import DishPagination
from dineres.permissions import IsChef
from dineres.serializers.food_serializers import IngredientSerializer, CategorySerializer, DishSerializer


class IngredientViewSet(viewsets.ViewSet, ListAPIView, CreateAPIView):
    queryset = Ingredient.objects.filter(active=True)
    serializer_class = IngredientSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


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


class CategoryViewSet(viewsets.ViewSet, ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get'], url_path='dishes', detail=True)
    def get_dishes(self, request, pk=None):
        dishes = filter_dish_queryset(self.get_object().dishes.filter(active=True), request.query_params)
        paginator = DishPagination()
        page = paginator.paginate_queryset(dishes, request)

        if page:
            serializer = DishSerializer(page, many=True, context={'request': request})
            return Response(paginator.get_paginated_response(serializer.data).data, status=status.HTTP_200_OK)
        else:
            return Response(DishSerializer(dishes, many=True).data, status=status.HTTP_200_OK)


class DishViewSet(viewsets.ModelViewSet):
    queryset = Dish.objects.filter(active=True).select_related('category', 'chef').prefetch_related('ingredients')
    serializer_class = DishSerializer
    parser_classes = [parsers.MultiPartParser]
    pagination_class = DishPagination
    filter_backends = [DjangoFilterBackend, rest_filters.OrderingFilter]
    filterset_class = DishFilter

    ordering_fields = ['name', 'price', 'rating']
    ordering = ['name']

    def get_queryset(self):
        query = self.queryset
        return filter_dish_queryset(query, self.request.query_params)

    def get_permissions(self):
        if self.action in ['list', 'compare_dishes']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsChef()]

    @action(methods=['get'], url_path='compare', detail=False)
    def compare_dishes(self, request):
        ids = request.query_params.get('ids')
        print(ids)
        if not ids:
            return Response({'message': 'Cần cung cấp danh sách ID món ăn'}, status=status.HTTP_400_BAD_REQUEST)

        id_list = [int(x.strip()) for x in ids.split(',') if x.isdigit()]
        print(id_list)
        dishes = (Dish.objects.filter(id__in=id_list)
                  .select_related('category', 'chef')
                  .prefetch_related('ingredients'))

        print(dishes.all())
        return Response(DishSerializer(dishes, many=True, context={'request': request}).data, status=status.HTTP_200_OK)
