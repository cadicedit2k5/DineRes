from django.core.validators import MinValueValidator, MaxValueValidator

from dineresapp import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField

# Create your models here.
# USER
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Quản trị viên'
        CUSTOMER = 'customer', 'Khách hàng'
        CHEF = 'chef', 'Đầu bếp'

    avatar = CloudinaryField('avatar', null=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True)
    user_role = models.CharField(max_length=10, choices=Role.choices, default=Role.CUSTOMER)

    def __str__(self):
        return f'{self.get_user_role_display()}: {self.last_name} {self.first_name}'

class Chef(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chef')
    is_verified = models.BooleanField(default=False)
    bio = RichTextField(null=True, blank=True)

    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    on_delete=models.SET_NULL,
                                    null=True,
                                    related_name='verified_chefs')

# BASE MODEL
class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True

# FOOD
class Category(BaseModel):
    name = models.CharField(max_length=50, unique=True, null=False)
    description = RichTextField(null=True, blank=True)
    image = CloudinaryField(null=True)

    def __str__(self):
        return self.name

class Ingredient(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Dish(BaseModel):
    name = models.CharField(max_length=50, unique=True, null=False)
    description = RichTextField()
    image = CloudinaryField(null=True)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    prep_time = models.IntegerField()
    is_available = models.BooleanField(default=True)

    chef = models.ForeignKey(Chef, on_delete=models.PROTECT, related_name='dish', null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='dish')
    ingredients = models.ManyToManyField(Ingredient, through='DishDetail')

    def __str__(self):
        return self.name

class DishDetail(models.Model):
    class Unit(models.TextChoices):
        GRAM = 'gram', 'Gram'
        ML = 'ml', 'Milliliter'
        SPOON = 'spoon', 'Thìa'
        PIECE = 'piece', 'Cái/Quả'

    amount = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.CharField(max_length=50, choices=Unit.choices)

    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('dish', 'ingredient')

# ORDER
class Order(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Chờ xử lý'
        PAID = 'paid', 'Đã thanh toán'
        DONE = 'done', 'Hoàn thành'
        CANCEL = 'cancel', 'Hủy'

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')

    def __str__(self):
        return f'Order #{self.pk} by {self.customer}'

class OrderDetail(models.Model):
    quantity = models.IntegerField(default=1)
    price_at_order = models.DecimalField(max_digits=10, decimal_places=0)

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='details')
    dish = models.ForeignKey(Dish, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('order', 'dish')

# Booking
class Table(BaseModel):
    name = models.CharField(max_length=50, null=False)
    capacity = models.IntegerField()

    def __str__(self):
        return self.name

class Booking(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Đang chờ'
        CONFIRMED = 'confirmed', 'Đã xác nhận',
        COMPLETED = 'completed', 'Đã dùng bữa'
        CANCELLED = 'cancelled', 'Đã hủy'

    booking_time = models.DateTimeField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    note = RichTextField(null=True, blank=True)

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    tables = models.ManyToManyField(Table, related_name='bookings')

    def __str__(self):
        return f'Booking #{self.pk} by {self.customer}'

# Payment
class Transaction(BaseModel):
    class Method(models.TextChoices):
        CASH = 'cash', 'Tiền mặt'
        PAYPAL = 'paypal', 'PayPal'
        MOMO = 'momo', 'MoMo'
        STRIPE = 'stripe', 'Stripe'
        ZLPAY = 'zlpay', 'ZaloPay'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Đang xử lý'
        SUCCESS = 'success', 'Thành công'
        FAILED = 'failed', 'Thất bại'
        REFUNDED = 'refunded', 'Hoàn tiền'

    amount = models.DecimalField(max_digits=12, decimal_places=0)
    payment_method = models.CharField(max_length=20, choices=Method.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    paid_at = models.DateTimeField(null=True)
    transaction_ref = models.CharField(max_length=255, unique=True, null=True, blank=True)
    raw_response = models.TextField(null=True, blank=True)

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='transactions')

    def __str__(self):
        return f"Transaction #{self.pk} - {self.get_status_display()} ({self.amount})"

# Comment
class Review(BaseModel):
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = RichTextField(null=True, blank=True)
    review_at = models.DateTimeField(auto_now_add=True)

    dish = models.ForeignKey('Dish', on_delete=models.CASCADE)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)