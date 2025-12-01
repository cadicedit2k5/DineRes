from unittest.mock import mock_open

from django.contrib.auth.models import AbstractUser
from django.db import models
from ckeditor.fields import RichTextField
# Create your models here.
# USER
class User(AbstractUser):
    USER_ROLE_CHOICES = [
        ('admin', 'Quản trị viên'),
        ('customer', 'Khách hàng'),
        ('chef', 'Đầu bếp'),
    ]

    avatar = models.ImageField(upload_to='users/avatars/%Y/%m', null=True)
    address = models.CharField(max_length=255, null=True)
    phone = models.CharField(max_length=15, unique=True)
    user_role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES, default='customer')

class Chef(models.Model):
    pass

# BASE MODEL
class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

# FOOD
class Category(BaseModel):
    name = models.CharField(max_length=50, unique=True, null=False)
    description = RichTextField(null=True, blank=True)
    image = models.ImageField(upload_to='categories/%Y/%m')

    def __str__(self):
        return self.name

class Ingredient(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Dish(BaseModel):
    name = models.CharField(max_length=50, unique=True, null=False)
    description = RichTextField(max_length=255)
    image = models.ImageField(upload_to='dishes/%Y/%m')
    price = models.DecimalField(max_digits=10, decimal_places=5)
    prep_time = models.IntegerField()
    is_available = models.BooleanField(default=True)


    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    ingredients = models.ManyToManyField(Ingredient, through='DishDetail')
    def __str__(self):
        return self.name

class DishDetail(models.Model):
    UNIT_CHOICES = [
        ('gram', 'Gram'),
        ('ml', 'Milliliter'),
        ('thia', 'Thìa'),
        ('qua', 'Quả'),
        ('cai', 'Cái'),
    ]

    amount = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.CharField(max_length=50, choices=UNIT_CHOICES)

    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('dish', 'ingredient')

# ORDER
class Order(BaseModel):
    pass


class OrderDetail(models.Model):
    pass

class Booking(BaseModel):
    pass

# Payment
class Transaction(BaseModel):
    pass

# Comment
class Review(BaseModel):
    pass