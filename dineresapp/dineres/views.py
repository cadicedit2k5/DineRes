from django.http import HttpResponse
from rest_framework import viewsets, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response

from dineres import serializers
from dineres.models import Category, Dish, User
from dineres.paginators import DishPagination
from dineres.serializers import CategorySerializer, DishSerializer, UserSerializer


def index(request):
    return HttpResponse("Dine Res Application")

class UserViewSet(viewsets.ViewSet, CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name', 'email']:
                    setattr(u, k, v)
            u.save()

        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)


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
