from django.http import HttpResponse
from rest_framework import viewsets, parsers, permissions
from rest_framework.generics import ListAPIView

from dineres.models import Category, Dish
from dineres.paginators import DishPagination
from dineres.serializers import CategorySerializer, DishSerializer


def index(request):
    return HttpResponse("Dine Res Application")

class CategoryViewSet(viewsets.ViewSet, ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    parser_classes = [parsers.MultiPartParser]


class DishViewSet(viewsets.ViewSet, ListAPIView):
    queryset = Dish.objects.all()
    serializer_class = DishSerializer
    parser_classes = [parsers.MultiPartParser]
    pagination_class = DishPagination
    permission_classes = [permissions.IsAuthenticated]
