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
from dineres.models import Category, Ingredient, Dish, DishDetail, User, Chef, Table
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
    },
    {
        "name": "Hải Sản",
    },
    {
        "name": "Món Nướng",
    },
    {
        "name": "Lẩu",
    },
    {
        "name": "Món Chay",
    },
    {
        "name": "Món Chính (Gà & Vịt)",
    },
    {
        "name": "Món Chính (Bò & Heo)",
    },
    {
        "name": "Cơm & Mì",
    },
    {
        "name": "Tráng Miệng",
    },
    {
        "name": "Đồ Uống",
    },
    {
        "name": "Set Combo Gia Đình",
    },
    {
        "name": "Món Đặc Biệt",
    }
]

for item in sample_categories:
    obj, created = Category.objects.get_or_create(
        name=item["name"],
    )

# 4. Tạo Ingredient
GRAM = Ingredient.Unit.GRAM
ML = Ingredient.Unit.ML
SPOON = Ingredient.Unit.SPOON
PIECE = Ingredient.Unit.PIECE

ingredients_data = [
    # --- THỊT & GIA CẦM ---
    {"name": "Thịt bò Mỹ ba chỉ", "unit": GRAM},
    {"name": "Thịt bò Wagyu", "unit": GRAM},
    {"name": "Sườn non heo", "unit": GRAM},
    {"name": "Thịt nạc vai heo", "unit": GRAM},
    {"name": "Gà ta nguyên con", "unit": GRAM},
    {"name": "Ức gà phi lê", "unit": GRAM},
    {"name": "Đùi gà góc tư", "unit": PIECE},
    {"name": "Vịt cỏ", "unit": GRAM},
    {"name": "Thịt cừu", "unit": GRAM},

    # --- HẢI SẢN ---
    {"name": "Tôm sú", "unit": GRAM},
    {"name": "Tôm hùm Alaska", "unit": GRAM},
    {"name": "Mực ống tươi", "unit": GRAM},
    {"name": "Bạch tuộc", "unit": GRAM},
    {"name": "Cua Cà Mau", "unit": GRAM},
    {"name": "Cá hồi Nauy", "unit": GRAM},
    {"name": "Cá chém phi lê", "unit": GRAM},
    {"name": "Nghêu/Sò", "unit": GRAM},
    {"name": "Hàu sữa", "unit": PIECE},

    # --- RAU CỦ QUẢ ---
    {"name": "Rau muống", "unit": GRAM },
    {"name": "Cải thìa", "unit": GRAM },
    {"name": "Xà lách", "unit": GRAM },
    {"name": "Cà chua", "unit": GRAM },
    {"name": "Khoai tây", "unit": GRAM },
    {"name": "Cà rốt", "unit": GRAM },
    {"name": "Nấm đông cô", "unit": GRAM },
    {"name": "Nấm kim châm", "unit": GRAM },
    {"name": "Hành tây", "unit": GRAM },
    {"name": "Tỏi", "unit": GRAM },
    {"name": "Ớt hiểm", "unit": GRAM },
    {"name": "Chanh tươi", "unit": PIECE },
    {"name": "Hành lá", "unit": GRAM },
    {"name": "Ngò rí", "unit": GRAM },

    # --- GIA VỊ & SỐT (Lỏng) ---
    {"name": "Nước mắm cốt", "unit": ML },
    {"name": "Nước tương (Xì dầu)", "unit": ML },
    {"name": "Dầu ăn", "unit": ML },
    {"name": "Dầu hào", "unit": ML },
    {"name": "Dầu mè", "unit": ML },
    {"name": "Giấm gạo", "unit": ML },
    {"name": "Sữa tươi không đường", "unit": ML },
    {"name": "Nước cốt dừa", "unit": ML },
    {"name": "Rượu vang nấu ăn", "unit": ML },

    # --- GIA VỊ KHÔ & BỘT ---
    {"name": "Muối tinh", "unit": GRAM },
    {"name": "Đường cát trắng", "unit": GRAM },
    {"name": "Đường phèn", "unit": GRAM },
    {"name": "Hạt nêm", "unit": GRAM },
    {"name": "Bột ngọt (Mì chính)", "unit": GRAM },
    {"name": "Tiêu đen xay", "unit": GRAM },
    {"name": "Bột năng", "unit": GRAM },
    {"name": "Bột chiên giòn", "unit": GRAM },
    {"name": "Ngũ vị hương", "unit": SPOON },

    # --- TINH BỘT ---
    {"name": "Gạo nếp cái hoa vàng", "unit": GRAM },
    {"name": "Gạo ST25", "unit": GRAM },
    {"name": "Mì trứng", "unit": GRAM },
    {"name": "Bún tươi", "unit": GRAM },
    {"name": "Bánh phở", "unit": GRAM },
    {"name": "Trứng gà", "unit": PIECE },
    {"name": "Trứng vịt muối", "unit": PIECE },
    {"name": "Đậu hũ non", "unit": PIECE },
]
for item in ingredients_data:
    Ingredient.objects.get_or_create(
        name=item["name"],
        defaults={
            "unit": item["unit"],
        }
    )

# 5. Tạo Dish
img_url = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
menu_data = {
    "Khai Vị": [
        ("Gỏi Ngó Sen Tôm Thịt", 85000, "Vị chua ngọt giòn tan của ngó sen kết hợp tôm thịt tươi.", "https://res.cloudinary.com/dxopigima/image/upload/v1768552725/cach-lam-goi-ngo-sen-ngon-khong-dung-dua-1-960_bwpp7b.jpg"),
        ("Chả Giò Rế Hải Sản", 75000, "Lớp vỏ rế giòn rụm, nhân hải sản đậm đà.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554476/cha-gio-re-khoai-mon-5_vatlir.jpg"),
        ("Súp Cua Bắp Mỹ", 65000, "Súp nóng hổi, ngọt thanh từ thịt cua và bắp.", img_url),
        ("Salad Rong Nho", 95000, "Rong nho biển tươi mát sốt mè rang.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554563/cach_lam_salad_rong_nho_thumb_04cc8d3ba6_o4l57t.webp"),
        ("Khoai Tây Chiên Bơ Tỏi", 55000, "Khoai tây chiên vàng ươm thơm lừng mùi bơ tỏi.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554513/2024_1_18_638411958438078614_cach-lam-khoai-tay-chien-bo-thumb_zedirz.webp")
    ],
    "Hải Sản": [
        ("Tôm Hùm Nướng Phô Mai", 1250000, "Tôm hùm Alaska nướng phô mai Mozzarella béo ngậy.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554657/2024_5_14_638512809538634523_tom-hum-nuong-pho-mai_en9isw.webp"),
        ("Cua Cà Mau Rang Me", 450000, "Cua gạch son xào sốt me chua ngọt đậm đà.", img_url),
        ("Mực Ống Hấp Hành Gừng", 180000, "Mực tươi giòn ngọt, thơm ấm vị gừng.", img_url),
        ("Ốc Hương Rang Muối Ớt", 220000, "Ốc hương loại 1 rang muối ớt cay nồng.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554691/oc-huong-rang-muoi-ot_twvadb.jpg"),
        ("Hàu Nướng Mỡ Hành", 25000, "Hàu sữa béo múp nướng mỡ hành đậu phộng (giá/con).", "https://res.cloudinary.com/dxopigima/image/upload/v1768554730/2023_3_20_638149134747091822_cach-lam-hau-nuong-mo-hanh-bang-lo-vi-song_ptmoni.webp")
    ],
    "Món Nướng": [
        ("Bò Tảng Nướng Sốt Tiêu", 350000, "Thịt bò nguyên tảng nướng mềm mọng.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554802/kd-f-9147_mb8m7d.png"),
        ("Sườn Cừu Nướng Mông Cổ", 420000, "Sườn cừu tẩm ướp gia vị đặc trưng không gây mùi.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554865/bi-quyet-lam-mon-suon-cuu-nuong-thom-ngon-chuan-vi-202109031353010809_ivdnch.jpg"),
        ("Ba Chỉ Heo Nướng Mật Ong", 150000, "Ba chỉ heo nướng cháy cạnh sốt mật ong.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554916/thit-ba-chi-nuong-14325936_lrnyqz.png"),
        ("Gà Nướng Muối Ớt", 190000, "Gà ta nướng da giòn, thịt dai ngọt.", "https://res.cloudinary.com/dxopigima/image/upload/v1768554990/3-cach-lam-ga-nuong-muoi-ot-cay-nong-thom-phuc-tai-nha-202201031306330323_ti0y4q.jpg"),
        ("Rau Củ Nướng Thập Cẩm", 90000, "Các loại rau củ Đà Lạt nướng dầu ô liu.", img_url)
    ],
    "Lẩu": [
        ("Lẩu Thái Tomyum", 350000, "Nước lẩu chua cay chuẩn vị Thái cùng hải sản.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555020/cung-lam-lau-thai-chua-chua-cay-cay-chuan-vi-truyen-thong-ngay-tai-nha-202209071437048493_b6x82c.jpg"),
        ("Lẩu Nấm Chim Câu", 400000, "Nước dùng thanh đạm hầm từ 10 loại nấm quý.", img_url),
        ("Lẩu Cua Đồng Hải Sản", 380000, "Riêu cua đồng béo ngậy ăn kèm hải sản tươi.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555089/lau-cua-dong-hai-san_bgunix.jpg"),
        ("Lẩu Bò Wagyu", 850000, "Thịt bò Wagyu nhúng lẩu Nhật Sukiyaki.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555131/thit-a5-886x800_lioqxy.png"),
        ("Lẩu Gà Lá Giang", 320000, "Vị chua thanh của lá giang giải nhiệt cực tốt.", img_url)
    ],
    "Món Chay": [
        ("Đậu Hũ Tứ Xuyên Chay", 85000, "Đậu hũ non sốt cay nồng đưa cơm.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555161/ngay-ram-doi-vi-voi-mon-dau-hu-tu-xuyen-chay-thom-ngon-kho-cuong-202101251435387995_dbeelw.jpg"),
        ("Nấm Kho Tộ", 90000, "Nấm đùi gà và nấm đông cô kho tiêu đậm đà.", img_url),
        ("Canh Chua Bạc Hà Chay", 70000, "Canh chua kiểu miền Tây với thơm và đậu bắp.", img_url),
        ("Cơm Chiên Gạo Lứt Rau Củ", 95000, "Món ăn healthy giàu chất xơ.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555242/cach-lam-com-gao-luc-chien-202008211416570276_leuovt.jpgc"),
        ("Mì Xào Giòn Chay", 85000, "Mì chiên giòn rụm xào cùng rau củ thập cẩm.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555206/IMG_9063_3-mi-xao-gion-chay_i2ekdb.png")
    ],
    "Món Chính (Gà & Vịt)": [
        ("Gà Hấp Lá Chanh", 250000, "Gà ta hấp da vàng óng, chấm muối tiêu chanh.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555284/2024_5_29_638525620147956264_ga-hap-la-chanh_qih4ay.webp"),
        ("Vịt Quay Bắc Kinh", 450000, "Da vịt quay giòn tan, thịt mềm ngọt.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555307/2-1200x676_on7a8b.jpg"),
        ("Cánh Gà Chiên Nước Mắm", 120000, "Cánh gà chiên giòn sốt mắm tỏi ớt.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555337/9_CQC2987_CanhGaChienSateTom_qpexyo.png"),
        ("Gà Nấu Cari Ấn Độ", 150000, "Cari gà béo ngậy nước cốt dừa ăn kèm bánh mì.", img_url),
        ("Vịt Om Sấu", 280000, "Vị chua thanh mát của sấu tươi miền Bắc.", img_url)
    ],
    "Món Chính (Bò & Heo)": [
        ("Bò Lúc Lắc Khoai Tây", 180000, "Bò cắt vuông xào lửa lớn mềm mọng.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555372/cach-lam-bo-luc-lac-ngon-244971-800_y0y82f.jpg"),
        ("Thịt Kho Tàu Trứng Muối", 120000, "Thịt ba chỉ kho rục với nước dừa tươi.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555433/CachlamTHITKHOTAUTRUNGMUOIdamdangon-MonAnNgon7-0screenshot-1200x675_aa6wuj.jpg"),
        ("Sườn Xào Chua Ngọt", 130000, "Sườn non chiên giòn sốt chua ngọt bắt cơm.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555476/cach_lam_suon_xao_chua_ngot_mien_bac_1_ba342f8410_n5x4z7.webp"),
        ("Bò Bít Tết Sốt Vang", 220000, "Thăn ngoại bò Úc áp chảo sốt rượu vang đỏ.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555515/cuoi-tuan-sang-chanh-voi-mon-bo-bit-tet-sot-ruou-vang-cuc-chill-202310171602318970_kkvkoh.jpg"),
        ("Heo Quay Bì Giòn", 160000, "Thịt heo quay da giòn tan chấm nước tương tỏi ớt.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555558/8-thanh-pham-heo-quay-bang-noi-chien-khong-dau-voi-lop-da-no-bong-bay-bat-mat_ynigti.jpg")
    ],
    "Cơm & Mì": [
        ("Cơm Chiên Cá Mặn", 110000, "Cơm chiên tơi xốp thơm lừng vị cá mặn.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555599/cach-lam-com-chien-ca-man-gion-ngon-chuan-nha-hang-202104101405061079_e8zi9m.jpg"),
        ("Mì Xào Bò Cải Ngồng", 120000, "Mì trứng xào thịt bò mềm và cải ngồng xanh.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555682/cach-lam-mi-xao-bo-rau-cai-ngon-005-20122015_dohpco.jpg"),
        ("Hủ Tiếu Xào Hải Sản", 130000, "Hủ tiếu mềm dai xào tôm mực.", img_url),
        ("Cơm Niêu Singapore", 140000, "Cơm cháy giòn rụm đáy nồi sốt thịt băm.", img_url),
        ("Miến Xào Cua Bể", 180000, "Miến dong dai ngon xào thịt cua bể gỡ sẵn.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555640/Mien-xao-cua-be-7-1756888873-8495-1756889015_wenkbh.jpg")
    ],
    "Tráng Miệng": [
        ("Chè Hạt Sen Long Nhãn", 45000, "Chè thanh mát bổ dưỡng, hạt sen bở tơi.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555743/buoc-6-thanh-pham-6-1690872108-2199-1690872376_zgsbul.jpg"),
        ("Bánh Flan Caramel", 35000, "Bánh flan mềm mịn béo ngậy trứng sữa.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555770/cach-lam-banh-flan-pho-mai_qbqjwz.jpg"),
        ("Trái Cây Dĩa Thập Cẩm", 80000, "Trái cây nhiệt đới tươi ngon theo mùa.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555828/hoa-qua-tiec-cuoi_fskkle.jpg"),
        ("Kem Dừa Thái Lan", 55000, "Kem dừa đặt trong trái dừa xiêm.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555852/kem_20dua_20thai_20lan_xteczv.jpg"),
        ("Rau Câu Sơn Thủy", 30000, "Rau câu giòn nhiều tầng màu sắc đẹp mắt.", img_url)
    ],
    "Đồ Uống": [
        ("Trà Đào Cam Sả", 55000, "Trà đào miếng giòn ngọt thơm mùi sả.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555888/cach-lam-tra-dao-cam-sa_xaba8s.jpg"),
        ("Cafe Sữa Đá Sài Gòn", 35000, "Cafe pha phin đậm đà truyền thống.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555904/1711097076-159736173-h-ng-d-n-chi-ti-t-pha-ca-phe-s-a-a-sieu-ngon-t-i-nha_ojd1g7.jpg"),
        ("Sinh Tố Bơ Riêng", 65000, "Bơ sáp dẻo béo ngậy xay cùng sữa đặc.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555935/cach-lam-sinh-to-bo-ngon-don-gian-khong-bi-dang-202111031415543158_nyvqix.jpg"),
        ("Nước Ép Dưa Hấu", 45000, "Nước ép nguyên chất thanh mát.", "https://res.cloudinary.com/dxopigima/image/upload/v1768555963/nuoc-ep-dua-hau-ngot-mat_h3nuk5.jpg"),
        ("Mojito Chanh Bạc Hà", 75000, "Soda chanh bạc hà mát lạnh sảng khoái.", img_url)
    ],
    "Set Combo Gia Đình": [
        ("Combo Lẩu Nướng 4 Người", 699000, "Tiết kiệm 20% với set lẩu nướng đầy đặn.", img_url),
        ("Combo Hải Sản Biển Đông", 999000, "Đại tiệc hải sản tươi sống cho 6 người.", img_url),
        ("Combo Cơm Gia Đình", 450000, "Bữa cơm chuẩn vị mẹ nấu: Canh, mặn, xào.", img_url),
        ("Combo Ăn Vặt", 299000, "Tổng hợp các món khai vị và ăn chơi.", img_url),
        ("Combo Tiệc Nhỏ", 1200000, "Thiết kế riêng cho tiệc sinh nhật nhóm nhỏ.", img_url)
    ],
    "Món Đặc Biệt": [
        ("Bò Dát Vàng 24K", 2500000, "Trải nghiệm thượng lưu với bò dát vàng.", "https://res.cloudinary.com/dxopigima/image/upload/v1768556018/bo-kobe-dat-vang-2_ocgvo8.jpg"),
        ("Tôm Hùm Sốt Bơ Tỏi", 1500000, "Món Signature của bếp trưởng.", "https://res.cloudinary.com/dxopigima/image/upload/v1768556090/tom_hum_nuong_bo_toi_bia_97264a9725_fp9yzk.webp"),
        ("Súp Vi Cá Bào Ngư", 890000, "Món ăn đại bổ từ nguyên liệu quý hiếm.", img_url),
        ("Gan Ngỗng Áp Chảo", 650000, "Gan ngỗng Pháp béo ngậy tan trong miệng.", img_url),
        ("Cá Tuyết Hấp Tương", 750000, "Cá tuyết trắng ngần, thịt dai ngọt tự nhiên.", "https://res.cloudinary.com/dxopigima/image/upload/v1768556121/Ca-tuyet-hap-xi-dau_bq0low.jpg")
    ]
}
all_ingredients = list(Ingredient.objects.all())
for cat_name, dishes in menu_data.items():
    category = Category.objects.filter(name=cat_name).first()

    if not category:
        category = Category.objects.filter(name__icontains=cat_name).first()

    if category:
        for dish_info in dishes:
            name, price, desc, img = dish_info

            dish, created = Dish.objects.update_or_create(
                name=name,
                defaults={
                    "price": price,
                    "description": desc,
                    "prep_time": random.randint(15, 45),
                    "category": category,
                    "image": img,
                },
                chef=chef_profile
            )

            # 6. Tạo DishDetail
            DishDetail.objects.filter(dish=dish).delete()
            count = min(len(all_ingredients), random.randint(3, 5))
            random_ingredients = random.sample(all_ingredients, count)

            for ing in random_ingredients:
                DishDetail.objects.create(
                    dish=dish,
                    ingredient=ing,
                    amount=random.randint(10, 500),
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
dishes = list(Dish.objects.filter(active=True).all())

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
        day = random.randint(1, datetime.datetime.now().day)
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



