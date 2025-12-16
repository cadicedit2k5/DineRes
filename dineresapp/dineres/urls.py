from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='categories')
router.register('dishes', views.DishViewSet, basename='dishes')

urlpatterns = [
    path('', include(router.urls)),
]