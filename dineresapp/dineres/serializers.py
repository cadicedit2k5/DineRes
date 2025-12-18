from rest_framework.serializers import ModelSerializer, IntegerField, CharField, JSONField
from .models import Category, User, Dish, Chef, Ingredient, DishDetail


# Các Serializer cơ bản
class ImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url if instance.image else ''

        return data


class IngredientSerializer(ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit']


class CategorySerializer(ImageSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']


class ChefSerializer(ModelSerializer):
    class Meta:
        model = Chef
        fields = ['bio', 'is_verified']
        extra_kwargs = {
            'is_verified': {
                'read_only': True
            }
        }


# --- USER SERIALIZERS ---
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


# DISH & DISH DETAIL SERIALIZERS
class DishDetailSerializer(ModelSerializer):
    id = IntegerField(source='ingredient.id')
    name = CharField(source='ingredient.name')
    unit = CharField(source='ingredient.unit')

    class Meta:
        model = DishDetail
        fields = ['id', 'name', 'unit', 'amount']


class DishSerializer(ImageSerializer):
    ingredients = JSONField(write_only=True, required=True)

    class Meta:
        model = Dish
        fields = ['id', 'name', 'description', 'price', 'prep_time', 'category', 'image', 'chef', 'ingredients']
        extra_kwargs = {
            'chef': {
                'read_only': True
            }
        }

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)

        request = self.context.get('request')
        if request and hasattr(request.user, 'chef'):
            validated_data['chef'] = request.user.chef

        dish = Dish.objects.create(**validated_data)

        for i in ingredients_data:
            ingredient = Ingredient.objects.get(pk=i['id'])
            DishDetail.objects.create(dish=dish, ingredient=ingredient, amount=i['amount'])

        return dish

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)

        dish = super().update(instance, validated_data)

        if ingredients_data:
            # Xoa tat ca nguyen lieu cu
            dish.dishdetail_set.all().delete()
            for i in ingredients_data:
                ingredient = Ingredient.objects.get(pk=i['id'])
                DishDetail.objects.create(dish=dish, ingredient=ingredient, amount=i['amount'])

        return dish


