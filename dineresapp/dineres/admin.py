from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Category, Dish, Order, Booking, Review, Table, Ingredient, User, DishDetail


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


admin_site = DineResAppAdmin(name='myadmin')

admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish)
admin_site.register(Order)
admin_site.register(Booking)
admin_site.register(Review)
admin_site.register(Table)
admin_site.register(Ingredient)
admin_site.register(DishDetail)