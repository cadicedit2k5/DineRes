import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator,StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Apis, { endpoints } from '../../utils/Apis';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoBack from '../../components/Layout/GoBack';

const DishDetail = () => {
  const route = useRoute();
  const [detail, setDetail] = useState(null);

  const loadDishDetail = async () => {
    try {
      const dishId = route.params?.dishId;
      if (dishId) {
          const res = await Apis.get(endpoints['dish-detail'](dishId));
          setDetail(res.data);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  useEffect(() => {
    loadDishDetail();
  }, [route.params?.dishId]);

  if (detail === null) {
    return (
      <View>
        <ActivityIndicator size="large" color="green" />
        <Text style={{marginTop: 10}}>Đang tải dữ liệu...</Text>
      </View>
    );
  }
  return (
    <SafeAreaView>
      <GoBack />
      <Text>DishDetail</Text>
      <Text>{detail.name}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default DishDetail;