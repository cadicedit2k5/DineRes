from rest_framework.serializers import ModelSerializer


class ImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url if instance.image else ''

        return data
