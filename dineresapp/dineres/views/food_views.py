from unicodedata import category

from django.db.models import Avg
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as rest_filters
from rest_framework import viewsets, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from dineres.filters import DishFilter
from dineres.models import Ingredient, Category, Dish
from dineres.paginators import DishPagination
from dineres.permissions import IsVerifiedChef
from dineres.serializers.food_serializers import IngredientSerializer, CategorySerializer, DishSerializer
from dineres.serializers.review_serializers import ReviewSerializer


class IngredientViewSet(viewsets.ViewSet, ListAPIView, CreateAPIView):
    queryset = Ingredient.objects.filter(active=True)
    serializer_class = IngredientSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [IsVerifiedChef()]


class CategoryViewSet(viewsets.ViewSet, ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get'], url_path='dishes', detail=True)
    def get_dishes(self, request, pk=None):
        category = self.get_object()
        dishes_queryset = (Dish.objects.filter(category=category, active=True).
                           select_related('category', 'chef').
                           prefetch_related('ingredients'))
        filtered_dishes = DishFilter(request.query_params, queryset=dishes_queryset).qs
        paginator = DishPagination()
        page = paginator.paginate_queryset(filtered_dishes, request)

        if page:
            serializer = DishSerializer(page, many=True, context={'request': request})
            return Response(paginator.get_paginated_response(serializer.data).data, status=status.HTTP_200_OK)
        else:
            return Response(DishSerializer(filtered_dishes, many=True, context={'request': request}).data, status=status.HTTP_200_OK)


class DishViewSet(viewsets.ModelViewSet):
    queryset = Dish.objects.filter(active=True).select_related('category').prefetch_related('dish_details')
    serializer_class = DishSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    pagination_class = DishPagination
    filter_backends = [DjangoFilterBackend, rest_filters.OrderingFilter]
    filterset_class = DishFilter

    ordering_fields = ['name', 'price', 'avg_rating']
    ordering = ['name']

    def get_queryset(self):
        return self.queryset.annotate(avg_rating=Avg('reviews__rating'))

    def get_permissions(self):
        if self.action in ['list', 'compare_dishes']:
            return [permissions.AllowAny()]
        elif self.action in ['reviews']:
            return [permissions.IsAuthenticated()]
        return [IsVerifiedChef()]

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

    @action(methods=['post', 'get'], detail=True, url_path='reviews')
    def reviews(self, request, pk=None):
        dish = self.get_object()
        if request.method == 'POST':
            serializer = ReviewSerializer(data={
                "customer": request.user.pk,
                "dish": self.get_object().pk,
                "comment": request.data.get('comment'),
                "rating": request.data.get('rating'),
            })
            serializer.is_valid(raise_exception=True)
            c = serializer.save()
            return Response(ReviewSerializer(c).data, status=status.HTTP_201_CREATED)


        reviews_qs = dish.reviews.select_related('customer', 'dish').all().order_by('-created_date')
        page = self.paginate_queryset(reviews_qs)
        if page is not None:
            serializer = ReviewSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ReviewSerializer(reviews_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
