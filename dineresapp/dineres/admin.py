from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.models import Group
from django.template.response import TemplateResponse
from django.utils.safestring import mark_safe
from django.utils.translation import ngettext
from django.urls import path
from rest_framework.exceptions import PermissionDenied
from rest_framework.reverse import reverse

from .dao import get_dishes_quantity_stats, get_dishes_quantity_timeline, get_dishes_amount_stats, get_dishes_quantity, \
    get_total_booking_timeline, get_total_booking_count
from .models import Category, Dish, Order, Booking, Review, Table, Ingredient, User, Chef, Transaction, Staff


class BaseAdmin(admin.ModelAdmin):
    readonly_fields = ['hinh_anh']
    stat = Category.objects.annotate()
    def hinh_anh(self, obj):
        if obj and obj.image:
            return mark_safe(
                '<img src="{url}" width="120" />'.format(url=obj.image.url)
            )
        return "Chưa có ảnh"

class DishIngredientInline(admin.TabularInline):
    model = Dish.ingredients.through

class DineResAppAdmin(admin.AdminSite):
    site_header = 'Hệ thống nhà hàng trực tuyển'

    def get_urls(self):
        return [
            path('dishes-stat/', self.admin_view(self.dishes_stats), name='dishes_stats'),
        ] + super().get_urls()

    def dishes_stats(self, request):
        if not request.user.has_perm('dineres.view_dish_statistics'):
            raise PermissionDenied("Bạn không có quyền xem thống kê doanh thu.")

        period_label = {
            'day': 'ngày',
            'week': 'tuần',
            'month': 'tháng'
        }

        time_param = request.GET.get('period', 'month')
        revenue_dishes_quantity_stats = get_dishes_quantity_stats(time_param)
        revenue_dishes_quantity_timeline = get_dishes_quantity_timeline(time_param)
        total_dishes_amount = get_dishes_amount_stats(time_param)['total_amount'] or 0
        dishes_quantity = get_dishes_quantity()
        revenue_booking_quantity_timeline = get_total_booking_timeline(time_param)
        total_booking_amount = get_total_booking_count(time_param)


        return TemplateResponse(request, 'admin/dishes-stats.html', {
            'total_quantity_stats': revenue_dishes_quantity_stats,
            'total_quantity_timeline': revenue_dishes_quantity_timeline,
            'total_amount_stat': total_dishes_amount,
            'period': time_param,
            'period_label': period_label.get(time_param, 'tháng'),
            'dishes_quantity': dishes_quantity,
            "total_booking_timeline": revenue_booking_quantity_timeline,
            'booking_amount': total_booking_amount
        })

    def get_app_list(self, request):
        app_list = super().get_app_list(request)

        if request.user.has_perm('dineres.view_dish_statistics'):
            stat_app = {
                'name': 'Báo cáo & Thống kê',
                'models': [
                    {
                        'name': 'Thống kê món ăn',
                        'object_name': 'dishes_stats',
                        'admin_url': reverse('admin:dishes_stats'),
                        'view_only': True,
                    }
                ]
            }

            app_list.append(stat_app)

        return app_list


class CategoryAdmin(BaseAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

class IngredientAdmin(BaseAdmin):
    list_display = ['id', 'name', 'unit', 'active']
    search_fields = ['name', 'unit']
    list_filter = ['active']
    inlines = [DishIngredientInline]

class DishAdmin(BaseAdmin):
    list_display = ['id', 'name', "chef__user", "category", 'price', "prep_time"]
    search_fields = ['name', 'category__name', 'chef__name']
    list_filter = ['active']
    list_per_page = 20
    inlines = [DishIngredientInline]

class ReviewAdmin(BaseAdmin):
    list_display = ['id', 'dish', 'rating', 'comment']
    search_fields = ['dish__name']

class ChefAdmin(admin.ModelAdmin):
    list_display = ['user__username','user__first_name', 'user__last_name','specialty', 'experience', 'is_verified']
    list_filter = ['is_verified']
    search_fields = ['user__first_name', 'user__last_name', 'specialty']
    list_per_page = 20
    actions = ['verify_chefs', 'reject_chefs']

    @admin.action(description='Duyệt hồ sơ')
    def verify_chefs(self, request, queryset):
        updated_count = 0

        for chef in queryset:
            if not chef.is_verified:
                chef.is_verified = True
                chef.verified_by = request.user
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
                chef.verified_by = None
                chef.save()

                chef.user.user_role = User.Role.CUSTOMER
                chef.user.save()

                updated_count += 1

        self.message_user(request, ngettext(
            '%d hồ sơ đã bị hủy trạng thái xác thực.',
            '%d hồ sơ đã bị hủy trạng thái xác thực.',
            updated_count,
        ) % updated_count, messages.WARNING)

class StaffAdmin(admin.ModelAdmin):
    list_display = ['user__first_name', 'is_verified']
    list_filter = ['is_verified']
    search_fields = ['user__first_name', 'user__last_name']
    list_per_page = 20
    actions = ['verify_staffs', 'reject_staffs']

    @admin.action(description='Duyệt hồ sơ')
    def verify_staffs(self, request, queryset):
        updated_count = 0

        for staff in queryset:
            if not staff.is_verified:
                staff.is_verified = True
                staff.verified_by = request.user
                staff.save()

                if staff.user.user_role != User.Role.STAFF:
                    staff.user.user_role = User.Role.STAFF
                    staff.user.save()

                updated_count += 1

        self.message_user(request, ngettext(
            '%d hồ sơ đã được duyệt thành công.',
            '%d hồ sơ đã được duyệt thành công.',
            updated_count,
        ) % updated_count, messages.SUCCESS)

    @admin.action(description='Hủy tư cách Nhân viên')
    def reject_staffs(self, request, queryset):
        updated_count = 0

        for staff in queryset:
            if staff.is_verified:
                staff.is_verified = False
                staff.verified_by = None
                staff.save()

                staff.user.user_role = User.Role.CUSTOMER
                staff.user.save()

                updated_count += 1

        self.message_user(request, ngettext(
            '%d hồ sơ đã bị hủy trạng thái xác thực.',
            '%d hồ sơ đã bị hủy trạng thái xác thực.',
            updated_count,
        ) % updated_count, messages.WARNING)

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', "first_name", "last_name", 'phone', 'email', 'user_role', 'is_active']
    search_fields = ['username', 'first_name', 'last_name']
    list_filter = ['is_active']
    list_per_page = 20


admin_site = DineResAppAdmin(name='myadmin')

admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish, DishAdmin)
admin_site.register(User, UserAdmin)
admin_site.register(Chef, ChefAdmin)
admin_site.register(Staff, StaffAdmin)
admin_site.register(Ingredient, IngredientAdmin)
admin_site.register(Booking)
admin_site.register(Table)
admin_site.register(Order)
admin_site.register(Transaction)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Group)