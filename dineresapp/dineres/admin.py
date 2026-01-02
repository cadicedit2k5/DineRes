from django.contrib import admin
from django.contrib import messages
from django.utils.safestring import mark_safe
from django.utils.translation import ngettext

from .models import Category, Dish, Order, Booking, Review, Table, Ingredient, User, DishDetail, Chef


# Register your models here.
class DineResAppAdmin(admin.AdminSite):
    site_header = 'Hệ thống nhà hàng trực tuyển'

class CategoryAdmin(admin.ModelAdmin):

    readonly_fields = ['hinh_anh']

    def hinh_anh(self, obj):
        if obj and obj.image:  # Kiểm tra xem có ảnh hay không
            return mark_safe(
                '<img src="{url}" width="120" />'.format(url=obj.image.url)
            )
        return "Chưa có ảnh"

class ChefAdmin(admin.ModelAdmin):
    list_display = ['user__first_name','specialty', 'experience', 'is_verified']
    list_filter = ['is_verified']
    search_fields = ['user__first_name', 'user__last_name', 'specialty']
    actions = ['verify_chefs', 'reject_chefs']

    @admin.action(description='Duyệt hồ sơ')
    def verify_chefs(self, request, queryset):
        updated_count = 0

        for chef in queryset:
            if not chef.is_verified:
                chef.is_verified = True
                chef.save()

                if chef.user.user_role != User.Role.CHEF:
                    chef.user.user_role = User.Role.CHEF
                    chef.user.save()

                updated_count += 1

        self.message_user(request, ngettext(
            '%d hồ sơ đã được duyệt thành công.',
            '%d hồ sơ đã được duyệt thành công.',
            updated_count,
        ) % updated_count, messages.SUCCESS)

    @admin.action(description='Hủy tư cách Đầu bếp')
    def reject_chefs(self, request, queryset):
        updated_count = 0

        for chef in queryset:
            if chef.is_verified:
                chef.is_verified = False
                chef.save()

                chef.user.user_role = User.Role.CUSTOMER
                chef.user.save()

                updated_count += 1

        self.message_user(request, ngettext(
            '%d hồ sơ đã bị hủy trạng thái xác thực.',
            '%d hồ sơ đã bị hủy trạng thái xác thực.',
            updated_count,
        ) % updated_count, messages.WARNING)

admin_site = DineResAppAdmin(name='myadmin')

admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish)
admin_site.register(User)
admin_site.register(Chef, ChefAdmin)
admin_site.register(Order)
admin_site.register(Booking)
admin_site.register(Review)
admin_site.register(Table)
admin_site.register(Ingredient)
admin_site.register(DishDetail)