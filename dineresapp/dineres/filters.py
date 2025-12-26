from django_filters import rest_framework as filters
from dineres.models import Dish

class DishFilter(filters.FilterSet):
    q = filters.CharFilter(field_name='name', lookup_expr='icontains')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    max_prep_time = filters.NumberFilter(field_name='prep_time', lookup_expr='lte')

    class Meta:
        model = Dish
        fields = ['category', 'chef']