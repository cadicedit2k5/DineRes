from rest_framework import serializers

from dineres.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    target_type = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_readed', 'created_date', 'target_type', 'object_id']

    def get_target_type(self, obj):
        return obj.content_type.model