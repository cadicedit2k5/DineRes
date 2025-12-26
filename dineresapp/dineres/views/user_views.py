from rest_framework import viewsets, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.response import Response

from dineres.models import User, Chef
from dineres.serializers.user_serializers import UserSerializer, UserUpdateSerializer


class UserViewSet(viewsets.ViewSet, CreateAPIView, ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['verify_chef']:
            return [permissions.IsAdminUser()]
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=['post'], url_path='verify-chef', detail=True)
    def verify_chef(self, request, pk=None):
        u = self.get_object()

        if u.user_role != User.Role.CHEF:
            return Response({"message": "User không phải là đầu bếp!"},status=status.HTTP_400_BAD_REQUEST)

        try:
            chef_profile = u.chef
            if chef_profile.is_verified == True:
                return Response({"message": "Đầu bếp đã đc duyệt truoc đó !"})
            chef_profile.is_verified = True
            chef_profile.verified_by = request.user
            chef_profile.save()
            return Response({"message": "Đã duyệt tài khoản đầu bếp thành công"}, status=status.HTTP_200_OK)
        except Chef.DoesNotExist:
            return Response({"message": "Không tìm thấy đầu bếp!"}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('GET'):
            return Response(UserSerializer(u).data, status=status.HTTP_200_OK)

        if request.method.__eq__('PATCH'):
            serializer = UserUpdateSerializer(u, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(u).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
