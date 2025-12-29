from drf_yasg.openapi import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView

from dineres.models import Notification
from dineres.permissions import IsUserOwner
from dineres.serializers.notification_serializers import NotificationSerializer
from dineres.services.notification_services import NotificationService


class NotificationViewSet(viewsets.ViewSet, ListAPIView):
    queryset = Notification.objects.filter(active=True)
    serializer_class = NotificationSerializer
    permission_classes = [IsUserOwner]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(methods=['get'], detail=False, url_path='unread_count')
    def unread_count(self, request):
        count = self.get_queryset().filter(is_readed=False).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=True, url_path='read')
    def mark_read(self, request, pk=None):
        is_update = NotificationService.mark_as_read(noti_id=pk, user=request.user)
        if is_update:
            return Response({"message": "Marked as read"}, status=status.HTTP_200_OK)
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(methods='patch', detail=True, url_path='read_all')
    def mark_all_read(self, request, pk=None):
        NotificationService.mark_as_read(user=request.user)



