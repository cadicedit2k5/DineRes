from dineres.models import Notification


class NotificationService:
    @staticmethod
    def create_notification(user, title, message, target_object):
        Notification.objects.create(user=user, title=title, message=message, content_object=target_object)

    @staticmethod
    def mark_as_read(noti_id, user):
        try:
            noti = Notification.objects.filter(id=noti_id, user=user)
            noti.update(id_readed=True)
            return True
        except Notification.DoesNotExist:
            return False

    @staticmethod
    def mark_all_as_read(user):
        Notification.objects.filter(user=user, is_readed=True).update(is_readed=False)
