from rest_framework.serializers import ModelSerializer
from .models import Category, User, Dish


class ImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url

        return data

# class UserSerializer(ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'avatar', 'first_name', 'last_name', 'username', 'password']
#
#         extra_kwargs = {
#             'password': {
#                 'write_only': True
#             }
#         }

class CategorySerializer(ImageSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class DishSerializer(ImageSerializer):
    class Meta:
        model = Dish
        fields = ['id', 'name', 'price', 'image', 'chef', 'category', 'ingredients', 'created_date']