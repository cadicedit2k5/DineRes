from rest_framework import serializers

from dineres.models import Review


class ReviewSerializer(serializers.ModelSerializer):
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