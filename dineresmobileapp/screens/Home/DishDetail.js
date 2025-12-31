import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Apis, { endpoints } from '../../utils/Apis';
import { Chip } from 'react-native-paper';

const DishDetail = () => {
  const route = useRoute();
  const [detail, setDetail] = useState(null); // Ban đầu dữ liệu là null

  useEffect(() => {
    const loadDishDetail = async () => {
      try {
        const dishId = route.params?.dishId; // Lấy ID an toàn
        if (dishId) {
            // Gọi API (Mất khoảng 0.5s - 1s mới xong)
            const res = await Apis.get(endpoints['dish-detail'](dishId));
            // Khi có dữ liệu, set lại state -> React sẽ render lại lần 2
            setDetail(res.data);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    loadDishDetail();
  }, [route.params?.dishId]);

  // === CHỐT CHẶN QUAN TRỌNG NHẤT ===
  // Nếu detail vẫn là null (API chưa trả về), hiện Loading và DỪNG LẠI, không chạy xuống dưới
  if (detail === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{marginTop: 10}}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // === PHẦN NÀY CHỈ CHẠY KHI DETAIL ĐÃ CÓ DỮ LIỆU ===
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: detail.image }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{detail.name}</Text>
        <Text style={styles.price}>{detail.price} VNĐ</Text>
        <Text style={styles.description}>{detail.description}</Text>
        
        {/* Render danh sách nguyên liệu */}
        <View style={styles.tags}>
            {detail.ingredients?.map((item) => (
                <Chip key={item.id} icon="check" style={styles.chip}>{item.name}</Chip>
            ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // Canh giữa Loading
  image: { width: '100%', height: 250, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  price: { fontSize: 18, color: 'green', marginVertical: 10 },
  description: { fontSize: 16, color: 'gray' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: { marginRight: 5, marginBottom: 5 }
});

export default DishDetail;