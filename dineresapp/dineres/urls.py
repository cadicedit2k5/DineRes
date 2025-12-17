from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='categories')
router.register('dishes', views.DishViewSet, basename='dishes')
router.register('users', views.UserViewSet, basename='users')
router.register('ingredients', views.IngredientViewSet, basename='ingredients')

urlpatterns = [
    path('', include(router.urls)),
]