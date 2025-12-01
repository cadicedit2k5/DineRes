from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Category, Dish
# Register your models here.

class CategoryAdmin(admin.ModelAdmin):

    readonly_fields = ['image']

    def image(self, obj):
        if (obj):
            return mark_safe(
                '<img src="/static/{url}" width="120" />'.format(url=obj.image.name)
            )

admin.site.register(Category, CategoryAdmin)
admin.site.register(Dish)
