from django.db import transaction
from rest_framework.exceptions import ValidationError
from rest_framework.fields import IntegerField, CharField, JSONField, SerializerMethodField
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
    rating = SerializerMethodField()

    class Meta:
        model = Dish
        fields = ['id', 'name', 'description', 'price', 'prep_time', 'category', 'image', 'rating', 'chef', 'ingredients']
        extra_kwargs = {
            'chef': {
                'read_only': True
            }
        }

    def get_rating(self, instance):
        return round(instance.avg_rating, 1) if instance.avg_rating else 0

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if hasattr(instance, 'ingredients'):
            data['ingredients'] = DishDetailSerializer(instance.dish_details, many=True).data

        return data

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)

        request = self.context.get('request')
        if request and hasattr(request.user, 'chef'):
            validated_data['chef'] = request.user.chef

        print(validated_data)

        with transaction.atomic():
            dish = Dish.objects.create(**validated_data)

            details_to_create = []
            for i in ingredients_data:
                try:
                    ingredient = Ingredient.objects.get(pk=i['id'])
                    details_to_create.append(DishDetail(dish=dish, ingredient=ingredient, amount=i['amount']))
                except Ingredient.DoesNotExist:
                    raise ValidationError({"ingredients": f"Nguyên liệu với id {i['id']} không tồn tại."})
                except KeyError:
                    raise ValidationError({"ingredients": "Dữ liệu nguyên liệu thiếu trường 'id' hoặc 'amount'."})

            DishDetail.objects.bulk_create(details_to_create)
            return dish

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)

        with transaction.atomic():
            dish = super().update(instance, validated_data)

            if ingredients_data:
                # Xoa tat ca nguyen lieu cu
                dish.dish_details.all().delete()
                details_to_update = []
                for i in ingredients_data:
                    try:
                        ingredient = Ingredient.objects.get(pk=i['id'])
                        details_to_update.append(DishDetail(dish=dish, ingredient=ingredient, amount=i['amount']))
                    except Ingredient.DoesNotExist:
                        raise ValidationError({"ingredients": f"Nguyên liệu với id {i['id']} không tồn tại."})
                    except KeyError:
                        raise ValidationError({"ingredients": "Dữ liệu nguyên liệu thiếu trường 'id' hoặc 'amount'."})

                DishDetail.objects.bulk_create(details_to_update)

        return dish
