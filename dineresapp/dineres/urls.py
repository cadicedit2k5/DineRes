from django.urls import path, include
from rest_framework import routers
from dineres.views import food_views, user_views, order_views, booking_views

router = routers.DefaultRouter()
router.register('categories', food_views.CategoryViewSet, basename='categories')
router.register('dishes', food_views.DishViewSet, basename='dishes')
router.register('users', user_views.UserViewSet, basename='users')
router.register('ingredients', food_views.IngredientViewSet, basename='ingredients')
router.register('orders', order_views.OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
]