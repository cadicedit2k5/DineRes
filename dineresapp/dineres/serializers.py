from rest_framework.serializers import ModelSerializer
from .models import Category, User, Dish


class ImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url

        return data

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar']

        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        u = User.objects.create_user(**validated_data)
        u.set_password(validated_data['password'])
        u.save()

        return u

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['avatar'] = instance.avatar.url if instance.avatar else ''

        return data


class CategorySerializer(ImageSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class DishSerializer(ImageSerializer):
    class Meta:
        model = Dish
        fields = ['id', 'name', 'price', 'image', 'chef', 'category', 'ingredients', 'created_date']