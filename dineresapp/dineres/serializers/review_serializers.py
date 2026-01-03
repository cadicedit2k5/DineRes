from rest_framework import serializers

from dineres.models import Review
from dineres.serializers.user_serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['customer'] = UserSerializer(instance.customer).data

        return data

    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'customer', 'dish', 'created_date']
        extra_kwargs = {
            'comment': {
                'error_messages': {
                    "required": "Nội dung đánh giá phải đc cung cấp",
                    "blank": "Nội dung đánh giá không đc rỗng",
                }
            }
        }