from rest_framework.serializers import ModelSerializer
from .models import Category, User

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