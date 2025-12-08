from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Category, Dish, Order, Booking, Review, Table, Ingredient
# Register your models here.

class DineResAppAdmin(admin.AdminSite):
    site_header = 'Hệ thống nhà hàng trực tuyển'

class CategoryAdmin(admin.ModelAdmin):

    readonly_fields = ['image']

    def image(self, obj):
        if (obj):
            return mark_safe(
                '<img src="/static/{url}" width="120" />'.format(url=obj.image.name)
            )


admin_site = DineResAppAdmin(name='myadmin')

admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish)
