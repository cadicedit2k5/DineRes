echo "=== cài đặt thư viện từ requirements.txt ==="
pip install -r requirements.txt

echo "=== Thực thi migrate cơ sở dữ liệu ==="
python manage.py migrate

echo "=== Tạo superuser ==="
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=Admin@123

python manage.py createsuperuser --no-input || echo "SuperUser đã tồn tại!"

echo "=== Chèn dữ liệu mẫu ==="
python manage.py shell  <<EOF
from dineres.models import Category, Ingredient, Dish, DishDetail, User, Chef
from django.contrib.auth import get_user_model

# Tạo admin
admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@gmail.com",
            password="Admin@123"
        )
admin_user.user_role = 'admin'
admin_user.first_name = "Super"
admin_user.last_name = "Manager"
admin_user.save()

Chef.objects.create(
            user=admin_user,
            bio="Quản trị hệ thống cũng biết nấu ăn.",
            is_verified=True # Admin thì tự duyệt chính mình luôn
        )

# 2. Tạo User & Chef
# Tạo user cho đầu bếp
chef_user, _ = User.objects.get_or_create(
    username='ramsay',
    defaults={
        'first_name': 'Gordon',
        'last_name': 'Ramsay',
        'email': 'gordon@kitchen.com',
        'phone': '0912345678',
        'user_role': User.Role.CHEF
    }
)
if _:
    chef_user.set_password('123456')
    chef_user.save()

# Tạo hồ sơ Chef
chef_profile, _ = Chef.objects.get_or_create(
    user=chef_user,
    defaults={
        'bio': 'Vua đầu bếp khó tính nhất thế giới.',
        'is_verified': True
    }
)

# 3. Tạo Category
c1, _ = Category.objects.get_or_create(name='Món Chính')
c2, _ = Category.objects.get_or_create(name='Khai Vị')
c3, _ = Category.objects.get_or_create(name='Đồ Uống')

# 4. Tạo Ingredient
i1, _ = Ingredient.objects.get_or_create(name='Thịt Bò Mỹ', defaults={'unit': 'kg'})
i2, _ = Ingredient.objects.get_or_create(name='Bánh Phở', defaults={'unit': 'kg'})
i3, _ = Ingredient.objects.get_or_create(name='Hành Tây', defaults={'unit': 'kg'})
i4, _ = Ingredient.objects.get_or_create(name='Trứng Gà', defaults={'unit': 'piece'})
i5, _ = Ingredient.objects.get_or_create(name='Bột Mì', defaults={'unit': 'gram'})

# 5. Tạo Dish
img_url = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
d1, created = Dish.objects.get_or_create(
    name='Phở Bò Đặc Biệt',
    defaults={
        'description': 'Phở bò tái nạm gầu gân.',
        'price': 65000,
        'prep_time': 15,
        'category': c1,
        'chef': chef_profile,
        'image': img_url,
        'is_available': True
    }
)

d2, created = Dish.objects.get_or_create(
    name='Bánh Mì Ốp La',
    defaults={
        'description': 'Bữa sáng nhanh gọn.',
        'price': 25000,
        'prep_time': 5,
        'category': c2,
        'chef': chef_profile,
        'image': img_url,
        'is_available': True
    }
)

# 6. Tạo DishDetail
DishDetail.objects.get_or_create(dish=d1, ingredient=i1, defaults={'amount': 0.2})
DishDetail.objects.get_or_create(dish=d1, ingredient=i2, defaults={'amount': 0.3})

DishDetail.objects.get_or_create(dish=d2, ingredient=i4, defaults={'amount': 2})
print("-> Đã tạo dữ liệu mẫu thành công!")

EOF

echo "=== Chạy server Django ==="
python manage.py runserver



