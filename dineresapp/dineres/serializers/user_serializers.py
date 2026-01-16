from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from dineres.models import Chef, User, Staff


class ChefSerializer(ModelSerializer):
    class Meta:
        model = Chef
        fields = ['id', 'bio', 'is_verified']
        extra_kwargs = {
            'is_verified': {
                'read_only': True
            }
        }


class ChefInfoSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Chef
        fields = ['id', 'full_name', 'avatar', 'specialty']

    def get_full_name(self, obj):
        return f"{obj.user.last_name} {obj.user.first_name}".strip()

    def get_avatar(self, obj):
        return obj.user.avatar.url if obj.user.avatar else ''

class UserSerializer(ModelSerializer):
    bio = serializers.CharField(required=False, write_only=True)
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar', 'email',
                  'phone', 'address', 'user_role', 'bio']

        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'user_role': {
                'read_only': True
            },
        }

    def create(self, validated_data):
        validated_data.pop('bio', None)
        u = User(**validated_data)
        u.set_password(u.password)
        u.save()

        return u

    def update(self, instance, validated_data):
        bio = validated_data.pop('bio', None)

        for k, v in validated_data.items():
            if k in ['first_name', 'last_name', 'avatar', 'email', 'phone', 'address']:
                setattr(instance, k, v)

        instance.save()

        if bio and hasattr(instance, 'chef'):
            instance.chef.bio = bio
            instance.chef.save()

        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['avatar'] = instance.avatar.url if instance.avatar else ''

        if hasattr(instance, 'chef'):
            data['chef'] = ChefSerializer(instance.chef).data

        return data