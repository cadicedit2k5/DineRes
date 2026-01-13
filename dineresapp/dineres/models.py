from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from rest_framework.exceptions import ValidationError

from dineresapp import settings
from django.contrib.auth.models import AbstractUser, Group
from django.db import models
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField

# Create your models here.
# USER
# Validate phone
phone_regex = RegexValidator(
    regex=r'^0\d{9,10}$',
    message="Số điện thoại phải bắt đầu bằng số 0 và có độ dài từ 10 đến 11 số."
)

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Quản trị viên'
        CUSTOMER = 'customer', 'Khách hàng'
        STAFF = 'staff', "Nhân viên"
        CHEF = 'chef', 'Đầu bếp'

    avatar = CloudinaryField('avatar', null=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True, validators=[phone_regex])
    user_role = models.CharField(max_length=10, choices=Role.choices, default=Role.CUSTOMER)

    def __str__(self):
        return f'{self.get_user_role_display()}: {self.last_name} {self.first_name}'

    def save(self, *args, **kwargs):
        if self.user_role in [self.Role.CHEF, self.Role.ADMIN]:
            self.is_staff = True
        else :
            self.is_staff = False
        super().save(*args, **kwargs)

        if self.user_role == self.Role.CHEF:
            self.groups.add(Group.objects.get(name='Chef'))
        elif self.user_role != self.Role.CHEF:
            self.groups.remove(Group.objects.get(name='Chef'))

class Chef(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chef')
    is_verified = models.BooleanField(default=False)
    bio = RichTextField(null=True, blank=True)
    experience = models.IntegerField(default=0)
    specialty = models.CharField(max_length=255, null=True, blank=True)

    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    on_delete=models.SET_NULL,
                                    null=True,
                                    related_name='verified_chefs')

    def __str__(self):
        return f'Chef: {self.user.last_name} {self.user.first_name}'

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

class IngredientType(BaseModel):
    name = models.CharField(max_length=50, unique=True, null=False)

    def __str__(self):
        return self.name

class Ingredient(BaseModel):
    class Unit(models.TextChoices):
        GRAM = 'gram', 'Gram'
        ML = 'ml', 'Milliliter'
        KG = 'kg', 'Kilogram'
        SPOON = 'spoon', 'Thìa'
        PIECE = 'piece', 'Cái/Quả'

    name = models.CharField(max_length=50, unique=True)
    unit = models.CharField(max_length=50, choices=Unit.choices, default=Unit.GRAM)
    type = models.ForeignKey(IngredientType, on_delete=models.PROTECT, related_name='ingredients', null=True)

    def __str__(self):
        return self.name

class Dish(BaseModel):
    name = models.CharField(max_length=50, unique=True, null=False)
    description = RichTextField()
    image = CloudinaryField(null=True)
    price = models.DecimalField(max_digits=10, decimal_places=0, validators=[MinValueValidator(0)], db_index=True)
    prep_time = models.IntegerField(validators=[MinValueValidator(1)])
    is_available = models.BooleanField(default=True)

    chef = models.ForeignKey(Chef, on_delete=models.PROTECT, related_name='dishes', null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='dishes')
    ingredients = models.ManyToManyField(Ingredient, through='DishDetail')

    class Meta:
        permissions = [
            ("view_dish_statistics", "Can view dish revenue statistics")
        ]

    def __str__(self):
        return self.name

class DishDetail(models.Model):
    amount = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0)])

    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name='dish_details')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('dish', 'ingredient')

class Combo(BaseModel):
    name = models.CharField(max_length=50, unique=True, null=False)
    price = models.DecimalField(max_digits=10, decimal_places=0, validators=[MinValueValidator(0)])

    dishes = models.ManyToManyField(Dish, through='ComboDetail')

class ComboDetail(models.Model):
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name='details')
    combo = models.ForeignKey(Combo, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('dish', 'combo')

# ORDER
class Order(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Chờ xử lý'
        DONE = 'done', 'Hoàn thành'
        PAID = 'paid', 'Đã thanh toán'
        CANCEL = 'cancel', 'Hủy'

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, validators=[MinValueValidator(0)])

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='staff')
    booking = models.ForeignKey('Booking', null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f'Order #{self.pk} by {self.customer}'

    def clean(self):
        if not self.pk:
            return

        old_order = Order.objects.get(pk=self.pk)

        if old_order.status == self.Status.DONE and self.status == self.Status.CANCEL:
            raise ValidationError("Món đã nấu xong không thể hùy!")

        if old_order.status == self.Status.CANCEL and self.status != self.Status.CANCEL:
            raise ValidationError("Đơn hàng đã hủy không thể khôi phục.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class OrderDetail(models.Model):
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    price_at_order = models.DecimalField(max_digits=10, decimal_places=0, validators=[MinValueValidator(0)])

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='details')
    dish = models.ForeignKey(Dish, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('order', 'dish')

    def clean(self):
        if not self.dish.is_available:
            raise ValidationError("Món ăn đã ngưng phục vụ!")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

# Booking
class Table(BaseModel):
    name = models.CharField(max_length=50, null=False)
    capacity = models.IntegerField(validators=[MinValueValidator(1)])

    def __str__(self):
        return self.name

class Booking(BaseModel):
    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Đã xác nhận'
        DINING = 'dining', 'Đang dùng bữa'
        COMPLETED = 'completed', 'Đã dùng bữa'
        CANCELLED = 'cancelled', 'Đã hủy'

    booking_time = models.DateTimeField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.CONFIRMED)
    note = RichTextField(null=True, blank=True)

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    tables = models.ManyToManyField(Table, related_name='bookings')

    def __str__(self):
        return f'Booking #{self.pk} by {self.customer}'

    def clean(self):
        if self.booking_time and self.booking_time < timezone.now():
            raise ValidationError({'booking_time': "Thời gian đặt bàn không thể ở trong quá khứ!"})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

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

    amount = models.DecimalField(max_digits=12, decimal_places=0, validators=[MinValueValidator(0)])
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

    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

class Notification(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')

    title = models.CharField(max_length=255)
    message = models.TextField()
    is_readed = models.BooleanField(default=False)

    # Giaỉ pháp lưu trữ geniric foreign key
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_date']
        indexes = [
            models.Index(fields=['user', 'is_readed']), # Danh chi muc phuc hop vi can ca hai thang
        ]

