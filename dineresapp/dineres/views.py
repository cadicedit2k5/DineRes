from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.generics import ListAPIView

from dineres.models import Category
from dineres.serializers import CategorySerializer


def index(request):
    return HttpResponse("Dine Res Application")

class CategoryViewSet(viewsets.ViewSet, ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer