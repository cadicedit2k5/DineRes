from django.urls import path, include
from rest_framework import routers
from dineres.views import food_views, user_views, order_views, booking_views, payment_views
from dineres.views.payment_views import PaymentIPNViewSet

router = routers.DefaultRouter()
router.register('categories', food_views.CategoryViewSet, basename='categories')
router.register('dishes', food_views.DishViewSet, basename='dishes')
router.register('users', user_views.UserViewSet, basename='users')
router.register('ingredients', food_views.IngredientViewSet, basename='ingredients')
router.register('orders', order_views.OrderViewSet, basename='orders')
router.register('payments', payment_views.CreatePaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
    path('api/ipn/<str:method>/', PaymentIPNViewSet.as_view(), name='payment-ipn'),
]