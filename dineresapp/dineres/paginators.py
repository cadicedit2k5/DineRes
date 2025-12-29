from rest_framework.pagination import PageNumberPagination

class DishPagination(PageNumberPagination):
    page_size = 20

class NotificationPagination(PageNumberPagination):
    page_size = 10