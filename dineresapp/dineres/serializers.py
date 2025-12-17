from rest_framework.serializers import ModelSerializer
from .models import Category, User, Dish, Chef


class ImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url

        return data

class ChefSerializer(ModelSerializer):
    class Meta:
        model = Chef
        fields = ['bio', 'is_verified']
        extra_kwargs = {
            'is_verified': {
                'read_only': True
            }
        }

class UserUpdateSerializer(ModelSerializer):
    chef = ChefSerializer(read_only=False)
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar', 'email',
                  'phone', 'address', 'chef']

    def update(self, instance, validated_data):
        chef_data = validated_data.pop('chef', None)

        instance = super().update(instance, validated_data)

        if chef_data and hasattr(instance, 'chef'):
            instance.chef.bio = chef_data['bio']
            instance.save()

        return instance


class UserSerializer(ModelSerializer):
    chef = ChefSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar', 'email',
                  'phone', 'address', 'user_role', 'chef']

        extra_kwargs = {
            'password': {
                'write_only': True
            },
            # 'user_role': {
            #     'read_only': True
            # },
        }

    def create(self, validated_data):
        u = User(**validated_data)
        u.set_password(u.password)
        u.save()

        if u.user_role == User.Role.CHEF:
            Chef.objects.create(user=u)

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