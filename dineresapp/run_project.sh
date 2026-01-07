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
from dineres.models import Category, Ingredient, Dish, DishDetail, User, Chef, IngredientType, Table
from django.contrib.auth import get_user_model
import random

User = get_user_model()

# --- 1. XỬ LÝ ADMIN USER (AN TOÀN) ---
if User.objects.filter(username="admin").exists():
    admin_user = User.objects.get(username="admin")
else:
    admin_user = User.objects.create_superuser("admin", "admin@gmail.com", "Admin@123")

admin_user.user_role = 'admin'
admin_user.first_name = "Super"
admin_user.last_name = "Manager"
admin_user.save()

#Chef.objects.create(
#            user=admin_user,
#            bio="Quản trị hệ thống cũng biết nấu ăn.",
#            is_verified=True # Admin thì tự duyệt chính mình luôn
#        )

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
sample_categories = [
    {
        "name": "Khai Vị",
        "description": "<p>Những món ăn nhẹ nhàng, tinh tế giúp kích thích vị giác để bắt đầu bữa tiệc hoàn hảo. Bao gồm gỏi, súp và các món cuốn.</p>"
    },
    {
        "name": "Hải Sản",
        "description": "<p>Tuyển chọn từ những nguyên liệu tươi ngon nhất biển cả: Tôm hùm, Cua Cà Mau, Mực ống và các loại ốc hương vị đậm đà.</p>"
    },
    {
        "name": "Món Nướng",
        "description": "<p>Thịt bò Mỹ, sườn non và rau củ được tẩm ướp sốt đặc biệt, nướng trên than hoa giữ trọn hương vị khói đặc trưng.</p>"
    },
    {
        "name": "Lẩu",
        "description": "<p>Nước dùng hầm từ xương trong 24h, kết hợp cùng các loại nấm quý, thịt bò Wagyu và rau xanh hữu cơ.</p>"
    },
    {
        "name": "Món Chay",
        "description": "<p>Thực đơn thanh đạm, tốt cho sức khỏe với nguyên liệu 100% từ thực vật, giàu dinh dưỡng và chất xơ.</p>"
    },
    {
        "name": "Món Chính (Gà & Vịt)",
        "description": "<p>Các món chế biến từ gia cầm như Gà đồi nướng lu, Vịt quay Bắc Kinh da giòn, Gà hấp lá chanh.</p>"
    },
    {
        "name": "Món Chính (Bò & Heo)",
        "description": "<p>Bò lúc lắc khoai tây chiên, Sườn heo nướng mật ong và các món thịt hầm tiêu chuẩn 5 sao.</p>"
    },
    {
        "name": "Cơm & Mì",
        "description": "<p>Cơm chiên dương châu, Mì xào giòn hải sản, Cơm niêu Singapore nóng hổi đậm đà hương vị Á Đông.</p>"
    },
    {
        "name": "Tráng Miệng",
        "description": "<p>Kết thúc bữa ăn ngọt ngào với Chè hạt sen, Bánh Plan, Kem trái cây nhiệt đới hoặc Trái cây tươi theo mùa.</p>"
    },
    {
        "name": "Đồ Uống",
        "description": "<p>Các loại nước ép trái cây tươi, soda Ý, trà thảo mộc giải nhiệt và các loại bia ướp lạnh sảng khoái.</p>"
    },
    {
        "name": "Set Combo Gia Đình",
        "description": "<p>Tiết kiệm hơn với các combo thiết kế riêng cho nhóm 4-6 người, đầy đủ từ khai vị đến tráng miệng.</p>"
    },
    {
        "name": "Món Đặc Biệt",
        "description": "<p>Những món ăn Signature do chính bếp trưởng 5 sao sáng tạo và chế biến, chỉ có tại nhà hàng.</p>"
    }
]

for item in sample_categories:
    obj, created = Category.objects.get_or_create(
        name=item["name"],
        defaults={"description": item["description"]}
    )

# 4. Tạo Ingredient
types_data = {
    'meat': "Thịt & Gia cầm",
    'seafood': "Hải sản",
    'vegetable': "Rau củ quả",
    'spice': "Gia vị sốt",
    'dry_spice': "Gia vị khô",
    'starch': "Tinh bột",
    'other': "Khác"
}

for slug, name in types_data.items():
    obj, created = IngredientType.objects.get_or_create(
        name=name,
    )

GRAM = Ingredient.Unit.GRAM
ML = Ingredient.Unit.ML
SPOON = Ingredient.Unit.SPOON
PIECE = Ingredient.Unit.PIECE

ingredients_data = [
    # --- THỊT & GIA CẦM ---
    {"name": "Thịt bò Mỹ ba chỉ", "unit": GRAM, "type": types_data["meat"]},
    {"name": "Thịt bò Wagyu", "unit": GRAM, "type": types_data["meat"]},
    {"name": "Sườn non heo", "unit": GRAM, "type": types_data["meat"]},
    {"name": "Thịt nạc vai heo", "unit": GRAM, "type": types_data["meat"]},
    {"name": "Gà ta nguyên con", "unit": GRAM, "type": types_data["meat"]},
    {"name": "Ức gà phi lê", "unit": GRAM, "type": types_data["meat"]},
    {"name": "Đùi gà góc tư", "unit": PIECE, "type": types_data["meat"]},
    {"name": "Vịt cỏ", "unit": GRAM, "type": types_data["meat"]},
    {"name": "Thịt cừu", "unit": GRAM, "type": types_data["meat"]},

    # --- HẢI SẢN ---
    {"name": "Tôm sú", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Tôm hùm Alaska", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Mực ống tươi", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Bạch tuộc", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Cua Cà Mau", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Cá hồi Nauy", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Cá chém phi lê", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Nghêu/Sò", "unit": GRAM, "type": types_data["seafood"]},
    {"name": "Hàu sữa", "unit": PIECE, "type": types_data["seafood"]},

    # --- RAU CỦ QUẢ ---
    {"name": "Rau muống", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Cải thìa", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Xà lách", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Cà chua", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Khoai tây", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Cà rốt", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Nấm đông cô", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Nấm kim châm", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Hành tây", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Tỏi", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Ớt hiểm", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Chanh tươi", "unit": PIECE, "type": types_data["vegetable"]},
    {"name": "Hành lá", "unit": GRAM, "type": types_data["vegetable"]},
    {"name": "Ngò rí", "unit": GRAM, "type": types_data["vegetable"]},

    # --- GIA VỊ & SỐT (Lỏng) ---
    {"name": "Nước mắm cốt", "unit": ML, "type": types_data["spice"]},
    {"name": "Nước tương (Xì dầu)", "unit": ML, "type": types_data["spice"]},
    {"name": "Dầu ăn", "unit": ML, "type": types_data["spice"]},
    {"name": "Dầu hào", "unit": ML, "type": types_data["spice"]},
    {"name": "Dầu mè", "unit": ML, "type": types_data["spice"]},
    {"name": "Giấm gạo", "unit": ML, "type": types_data["spice"]},
    {"name": "Sữa tươi không đường", "unit": ML, "type": types_data["spice"]},
    {"name": "Nước cốt dừa", "unit": ML, "type": types_data["spice"]},
    {"name": "Rượu vang nấu ăn", "unit": ML, "type": types_data["spice"]},

    # --- GIA VỊ KHÔ & BỘT ---
    {"name": "Muối tinh", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Đường cát trắng", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Đường phèn", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Hạt nêm", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Bột ngọt (Mì chính)", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Tiêu đen xay", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Bột năng", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Bột chiên giòn", "unit": GRAM, "type": types_data["dry_spice"]},
    {"name": "Ngũ vị hương", "unit": SPOON, "type": types_data["dry_spice"]},

    # --- TINH BỘT ---
    {"name": "Gạo nếp cái hoa vàng", "unit": GRAM, "type": types_data["starch"]},
    {"name": "Gạo ST25", "unit": GRAM, "type": types_data["starch"]},
    {"name": "Mì trứng", "unit": GRAM, "type": types_data["starch"]},
    {"name": "Bún tươi", "unit": GRAM, "type": types_data["starch"]},
    {"name": "Bánh phở", "unit": GRAM, "type": types_data["starch"]},
    {"name": "Trứng gà", "unit": PIECE, "type": types_data["starch"]},
    {"name": "Trứng vịt muối", "unit": PIECE, "type": types_data["starch"]},
    {"name": "Đậu hũ non", "unit": PIECE, "type": types_data["starch"]},
]
for item in ingredients_data:
    type_obj = IngredientType.objects.filter(name__icontains=item["type"]).first()

    if type_obj:
        Ingredient.objects.get_or_create(
            name=item["name"],
            defaults={
                "unit": item["unit"],
                "type": type_obj
            }
        )

# 5. Tạo Dish
img_url = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
menu_data = {
    "Khai Vị": [
        ("Gỏi Ngó Sen Tôm Thịt", 85000, "Vị chua ngọt giòn tan của ngó sen kết hợp tôm thịt tươi."),
        ("Chả Giò Rế Hải Sản", 75000, "Lớp vỏ rế giòn rụm, nhân hải sản đậm đà."),
        ("Súp Cua Bắp Mỹ", 65000, "Súp nóng hổi, ngọt thanh từ thịt cua và bắp."),
        ("Salad Rong Nho", 95000, "Rong nho biển tươi mát sốt mè rang."),
        ("Khoai Tây Chiên Bơ Tỏi", 55000, "Khoai tây chiên vàng ươm thơm lừng mùi bơ tỏi.")
    ],
    "Hải Sản": [
        ("Tôm Hùm Nướng Phô Mai", 1250000, "Tôm hùm Alaska nướng phô mai Mozzarella béo ngậy."),
        ("Cua Cà Mau Rang Me", 450000, "Cua gạch son xào sốt me chua ngọt đậm đà."),
        ("Mực Ống Hấp Hành Gừng", 180000, "Mực tươi giòn ngọt, thơm ấm vị gừng."),
        ("Ốc Hương Rang Muối Ớt", 220000, "Ốc hương loại 1 rang muối ớt cay nồng."),
        ("Hàu Nướng Mỡ Hành", 25000, "Hàu sữa béo múp nướng mỡ hành đậu phộng (giá/con).")
    ],
    "Món Nướng": [
        ("Bò Tảng Nướng Sốt Tiêu", 350000, "Thịt bò nguyên tảng nướng mềm mọng."),
        ("Sườn Cừu Nướng Mông Cổ", 420000, "Sườn cừu tẩm ướp gia vị đặc trưng không gây mùi."),
        ("Ba Chỉ Heo Nướng Mật Ong", 150000, "Ba chỉ heo nướng cháy cạnh sốt mật ong."),
        ("Gà Nướng Muối Ớt", 190000, "Gà ta nướng da giòn, thịt dai ngọt."),
        ("Rau Củ Nướng Thập Cẩm", 90000, "Các loại rau củ Đà Lạt nướng dầu ô liu.")
    ],
    "Lẩu": [
        ("Lẩu Thái Tomyum", 350000, "Nước lẩu chua cay chuẩn vị Thái cùng hải sản."),
        ("Lẩu Nấm Chim Câu", 400000, "Nước dùng thanh đạm hầm từ 10 loại nấm quý."),
        ("Lẩu Cua Đồng Hải Sản", 380000, "Riêu cua đồng béo ngậy ăn kèm hải sản tươi."),
        ("Lẩu Bò Wagyu", 850000, "Thịt bò Wagyu nhúng lẩu Nhật Sukiyaki."),
        ("Lẩu Gà Lá Giang", 320000, "Vị chua thanh của lá giang giải nhiệt cực tốt.")
    ],
    "Món Chay": [
        ("Đậu Hũ Tứ Xuyên Chay", 85000, "Đậu hũ non sốt cay nồng đưa cơm."),
        ("Nấm Kho Tộ", 90000, "Nấm đùi gà và nấm đông cô kho tiêu đậm đà."),
        ("Canh Chua Bạc Hà Chay", 70000, "Canh chua kiểu miền Tây với thơm và đậu bắp."),
        ("Cơm Chiên Gạo Lứt Rau Củ", 95000, "Món ăn healthy giàu chất xơ."),
        ("Mì Xào Giòn Chay", 85000, "Mì chiên giòn rụm xào cùng rau củ thập cẩm.")
    ],
    "Món Chính (Gà & Vịt)": [
        ("Gà Hấp Lá Chanh", 250000, "Gà ta hấp da vàng óng, chấm muối tiêu chanh."),
        ("Vịt Quay Bắc Kinh", 450000, "Da vịt quay giòn tan, thịt mềm ngọt."),
        ("Cánh Gà Chiên Nước Mắm", 120000, "Cánh gà chiên giòn sốt mắm tỏi ớt."),
        ("Gà Nấu Cari Ấn Độ", 150000, "Cari gà béo ngậy nước cốt dừa ăn kèm bánh mì."),
        ("Vịt Om Sấu", 280000, "Vị chua thanh mát của sấu tươi miền Bắc.")
    ],
    "Món Chính (Bò & Heo)": [
        ("Bò Lúc Lắc Khoai Tây", 180000, "Bò cắt vuông xào lửa lớn mềm mọng."),
        ("Thịt Kho Tàu Trứng Muối", 120000, "Thịt ba chỉ kho rục với nước dừa tươi."),
        ("Sườn Xào Chua Ngọt", 130000, "Sườn non chiên giòn sốt chua ngọt bắt cơm."),
        ("Bò Bít Tết Sốt Vang", 220000, "Thăn ngoại bò Úc áp chảo sốt rượu vang đỏ."),
        ("Heo Quay Bì Giòn", 160000, "Thịt heo quay da giòn tan chấm nước tương tỏi ớt.")
    ],
    "Cơm & Mì": [
        ("Cơm Chiên Cá Mặn", 110000, "Cơm chiên tơi xốp thơm lừng vị cá mặn."),
        ("Mì Xào Bò Cải Ngồng", 120000, "Mì trứng xào thịt bò mềm và cải ngồng xanh."),
        ("Hủ Tiếu Xào Hải Sản", 130000, "Hủ tiếu mềm dai xào tôm mực."),
        ("Cơm Niêu Singapore", 140000, "Cơm cháy giòn rụm đáy nồi sốt thịt băm."),
        ("Miến Xào Cua Bể", 180000, "Miến dong dai ngon xào thịt cua bể gỡ sẵn.")
    ],
    "Tráng Miệng": [
        ("Chè Hạt Sen Long Nhãn", 45000, "Chè thanh mát bổ dưỡng, hạt sen bở tơi."),
        ("Bánh Flan Caramel", 35000, "Bánh flan mềm mịn béo ngậy trứng sữa."),
        ("Trái Cây Dĩa Thập Cẩm", 80000, "Trái cây nhiệt đới tươi ngon theo mùa."),
        ("Kem Dừa Thái Lan", 55000, "Kem dừa đặt trong trái dừa xiêm."),
        ("Rau Câu Sơn Thủy", 30000, "Rau câu giòn nhiều tầng màu sắc đẹp mắt.")
    ],
    "Đồ Uống": [
        ("Trà Đào Cam Sả", 55000, "Trà đào miếng giòn ngọt thơm mùi sả."),
        ("Cafe Sữa Đá Sài Gòn", 35000, "Cafe pha phin đậm đà truyền thống."),
        ("Sinh Tố Bơ Riêng", 65000, "Bơ sáp dẻo béo ngậy xay cùng sữa đặc."),
        ("Nước Ép Dưa Hấu", 45000, "Nước ép nguyên chất thanh mát."),
        ("Mojito Chanh Bạc Hà", 75000, "Soda chanh bạc hà mát lạnh sảng khoái.")
    ],
    "Set Combo Gia Đình": [
        ("Combo Lẩu Nướng 4 Người", 699000, "Tiết kiệm 20% với set lẩu nướng đầy đặn."),
        ("Combo Hải Sản Biển Đông", 999000, "Đại tiệc hải sản tươi sống cho 6 người."),
        ("Combo Cơm Gia Đình", 450000, "Bữa cơm chuẩn vị mẹ nấu: Canh, mặn, xào."),
        ("Combo Ăn Vặt", 299000, "Tổng hợp các món khai vị và ăn chơi."),
        ("Combo Tiệc Nhỏ", 1200000, "Thiết kế riêng cho tiệc sinh nhật nhóm nhỏ.")
    ],
    "Món Đặc Biệt": [
        ("Bò Dát Vàng 24K", 2500000, "Trải nghiệm thượng lưu với bò dát vàng."),
        ("Tôm Hùm Sốt Bơ Tỏi", 1500000, "Món Signature của bếp trưởng."),
        ("Súp Vi Cá Bào Ngư", 890000, "Món ăn đại bổ từ nguyên liệu quý hiếm."),
        ("Gan Ngỗng Áp Chảo", 650000, "Gan ngỗng Pháp béo ngậy tan trong miệng."),
        ("Cá Tuyết Hấp Tương", 750000, "Cá tuyết trắng ngần, thịt dai ngọt tự nhiên.")
    ]
}

for cat_name, dishes in menu_data.items():
    category = Category.objects.filter(name=cat_name).first()

    if not category:
        category = Category.objects.filter(name__icontains=cat_name).first()

    if category:
        for dish_info in dishes:
            name, price, desc = dish_info

            dish, created = Dish.objects.get_or_create(
                name=name,
                defaults={
                    "price": price,
                    "description": desc,
                    "prep_time": random.randint(15, 45),
                    "is_available": True,
                    "category": category,
                    "image": img_url,
                },
                chef=chef_profile
            )

# 6. Tạo DishDetail
if created:
    all_ingredients = list(Ingredient.objects.all())
    if all_ingredients:
        # Random 3-5 nguyên liệu cho món ăn
        random_ingredients = random.sample(all_ingredients, min(len(all_ingredients), random.randint(3, 5)))
        for ing in random_ingredients:
            DishDetail.objects.create(
                dish=dish,
                ingredient=ing,
                amount=random.randint(10, 500)
            )

#7. Tạo Table
tables = [
  {"name": "Bàn 1", "capacity": 4},
  {"name": "Bàn 2", "capacity": 4},
  {"name": "Bàn 3", "capacity": 4},
  {"name": "Bàn 4", "capacity": 4},
  {"name": "Bàn 5", "capacity": 6},
  {"name": "Bàn 6", "capacity": 6},
  {"name": "Bàn 7", "capacity": 6},
  {"name": "Bàn 8", "capacity": 6},
  {"name": "Bàn 9", "capacity": 8},
  {"name": "Bàn 10", "capacity": 8},
  {"name": "Bàn 11", "capacity": 8},
  {"name": "Bàn 12", "capacity": 8},
  {"name": "Bàn 13", "capacity": 10},
  {"name": "Bàn 14", "capacity": 10},
  {"name": "Bàn 15", "capacity": 10},
  {"name": "Bàn 16", "capacity": 10}
]

for item in tables:
    Table.objects.get_or_create(
        name=item["name"],
        defaults={"capacity": item["capacity"]}
    )

#8. Tạo customer
print("-> Đang tạo dữ liệu khách hàng...")
customers = []
for i in range(1, 6):  # Tạo 5 khách hàng mẫu
    user, created = User.objects.get_or_create(
        username=f'customer{i}',
        defaults={
            'first_name': f'Khách',
            'last_name': f'Hàng {i}',
            'email': f'customer{i}@gmail.com',
            'phone': f'098765432{i}',
            'user_role': User.Role.CUSTOMER
        }
    )
    if created:
        user.set_password('123456')
        user.save()
    customers.append(user)

#10. tạo order và orderDetail
import random
import datetime
from django.utils.timezone import make_aware
from django.db import transaction

from dineres.models import (
    User, Dish, Order, OrderDetail, Transaction
)

customers = list(User.objects.filter(user_role=User.Role.CUSTOMER))
dishes = list(Dish.objects.all())

if not customers or not dishes:
    print("Thiếu customer hoặc dish")
    exit()

YEAR = 2026
MONTH = 1
ORDERS_COUNT = 60

@transaction.atomic
def seed_january_orders():
    for _ in range(ORDERS_COUNT):
        customer = random.choice(customers)

        # random ngày trong tháng 1
        day = random.randint(1, 31)
        hour = random.randint(10, 22)
        minute = random.randint(0, 59)

        naive_dt = datetime.datetime(
            YEAR, MONTH, day, hour, minute
        )
        order_date = make_aware(naive_dt)

        status = random.choices(
            [Order.Status.PAID, Order.Status.DONE, Order.Status.CANCEL],
            weights=[0.7, 0.2, 0.1]
        )[0]

        # Tạo Order
        order = Order.objects.create(
            customer=customer,
            status=status,
            total_amount=0
        )

        # Ép created_date (KHÔNG dùng save)
        Order.objects.filter(pk=order.pk).update(
            created_date=order_date
        )

        # OrderDetail
        selected_dishes = random.sample(
            dishes,
            random.randint(2, 5)
        )

        total_amount = 0
        for dish in selected_dishes:
            qty = random.randint(1, 3)
            OrderDetail.objects.create(
                order=order,
                dish=dish,
                quantity=qty,
                price_at_order=dish.price
            )
            total_amount += dish.price * qty

        # Update tổng tiền
        Order.objects.filter(pk=order.pk).update(
            total_amount=total_amount
        )

        # Transaction
        if status in [Order.Status.PAID, Order.Status.DONE]:
            Transaction.objects.create(
                order=order,
                amount=total_amount,
                payment_method=random.choice(
                    [m[0] for m in Transaction.Method.choices]
                ),
                status=Transaction.Status.SUCCESS,
                paid_at=order_date + datetime.timedelta(
                    minutes=random.randint(5, 30)
                ),
                transaction_ref=f"JAN-{order.id}-{random.randint(1000, 9999)}"
            )

seed_january_orders()

print("-> Đã tạo dữ liệu mẫu thành công!")

EOF

echo "=== Chạy server Django ==="
python manage.py runserver



