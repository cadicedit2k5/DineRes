from rest_framework.fields import IntegerField, CharField, JSONField
from rest_framework.serializers import ModelSerializer

from dineres.models import Ingredient, Category, DishDetail, Dish
from dineres.serializers.general_serializers import ImageSerializer


class IngredientSerializer(ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit']


class CategorySerializer(ImageSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']


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
