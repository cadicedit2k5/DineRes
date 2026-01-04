from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.models import Group
from django.utils.safestring import mark_safe
from django.utils.translation import ngettext

from .models import Category, Dish, Order, Booking, Review, Table, Ingredient, User, Chef, Transaction

# Base Admin
class BaseAdmin(admin.ModelAdmin):
    readonly_fields = ['hinh_anh']
    def hinh_anh(self, obj):
        if obj and obj.image:
            return mark_safe(
                '<img src="{url}" width="120" />'.format(url=obj.image.url)
            )
        return "Chưa có ảnh"

# Inline Admin
class DishIngredientInline(admin.TabularInline):
    model = Dish.ingredients.through

# Register your models here.
class DineResAppAdmin(admin.AdminSite):
    site_header = 'Hệ thống nhà hàng trực tuyển'

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
    list_display = ['user__first_name','specialty', 'experience', 'is_verified']
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

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', "first_name", "last_name", 'phone', 'email', 'is_active']
    search_fields = ['username', 'first_name', 'last_name']
    list_filter = ['is_active']
    list_per_page = 20


admin_site = DineResAppAdmin(name='myadmin')

admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish, DishAdmin)
admin_site.register(User, UserAdmin)
admin_site.register(Chef, ChefAdmin)
admin_site.register(Ingredient, IngredientAdmin)
admin_site.register(Booking)
admin_site.register(Table)
admin_site.register(Order)
admin_site.register(Transaction)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Group)