import { useContext, useEffect, useState } from 'react';
import { View, ScrollView, Image, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { Text, Icon, Divider, Avatar, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import GoBack from '../../components/Layout/GoBack';
import Apis, { endpoints } from '../../utils/Apis';
import QuantityChange from '../../components/Layout/QuantityChange';
import MyButton from '../../components/Layout/MyButton';
import Rating from '../../components/Layout/Rating';
import DishReviews from '../../components/DishReviews';
import RenderHTML from 'react-native-render-html';
import { MyCartContext, ViewModeContext } from '../../utils/contexts/MyContexts';

const DishDetail = () => {
    const route = useRoute();
    const dishId = route?.params?.dishId;
    const mode = route?.params.mode;
    const [dish, setDish] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCustomerView] = useContext(ViewModeContext);
    const [, cartDispatch] = useContext(MyCartContext);
    const nav = useNavigation();

    const {width} = useWindowDimensions();

    const loadDishDetail = async () => {
      try {
        if (dishId) {
            const res = await Apis.get(endpoints['dish-detail'](dishId));
            console.log(res.data)
            setDish(res.data);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    

    useEffect(() => {
      loadDishDetail();
    }, [dishId]);

    const handleAddToCart = async () => {
        try {
            setLoading(true);

            cartDispatch({
                type: "add",
                payload: {
                    ...dish,
                    quantity: quantity
                }
            })
        } catch (error) {
            console.error(error);
        }finally {
            setLoading(false);
        }
    }   

    if (dish === null) {
      return (
        <View>
          <ActivityIndicator size="large"/>
        </View>
      );
    }
    // Hàm tăng giảm số lượng
    const increaseQty = () => setQuantity(q => q + 1);
    const decreaseQty = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar translucent backgroundColor="transparent" />
            
            {/* 1. HEADER ẢNH MÓN ĂN */}
            <View style={styles.headerContainer}>
                <Image source={{ uri: dish.image }} style={styles.headerImage} resizeMode="cover" />
                
                {/* Nút Back đè lên ảnh */}
                <View style={styles.headerButtons}>
                    <GoBack />
                </View>
            </View>

            {/* 2. NỘI DUNG CHI TIẾT (Kéo đè lên ảnh một chút) */}
            <View style={styles.contentContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    
                    {/* Tên và Giá */}
                    <View style={styles.titleRow}>
                        <Text variant="headlineSmall" style={styles.dishName}>{dish.name}</Text>
                        <Text variant="headlineSmall" style={styles.dishPrice}>
                            {parseInt(dish.price).toLocaleString('vi-VN')}đ
                        </Text>
                    </View>

                    {/* Rating và Thời gian */}
                    <View style={styles.metaRow}>
                        <Rating 
                            rating={dish.rating}
                            review_count={`${dish.review_count} đánh giá`}
                        />
                        <View style={styles.metaItem}>
                            <Icon source="clock-outline" color="#666" size={20} />
                            <Text style={styles.metaText}>{dish.prep_time} phút</Text>
                        </View>
                        <View style={styles.metaItem}>
                             <Icon source="fire" color="#ee6a0dff" size={20} />
                             <Text style={styles.metaText}>{dish.ingredients.length} nguyên liệu</Text>
                        </View>
                    </View>

                    <Divider style={{ marginVertical: 15 }} />

                    {/* Thông tin Đầu bếp (Chef) */}
                    <View style={styles.chefRow}>
                        <Avatar.Image size={40} source={{ uri: dish.chef.avatar || 'https://i.pravatar.cc/150?img=12' }} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{ fontWeight: 'bold' }}>{dish.chef.full_name}</Text>
                            <Text variant="bodySmall" style={{ color: '#666' }}>{dish.chef.specialty}</Text>
                        </View>
                    </View>

                    <Divider style={{ marginVertical: 15 }} />

                    {/* Mô tả */}
                    <Text variant="titleMedium" style={styles.sectionTitle}>Mô tả</Text>
                    <RenderHTML
                        contentWidth={width}
                        source={{ 'html': dish.description }}
                        baseStyle={styles.description}
                    />

                    {/* Thành phần nguyên liệu */}
                    <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 20 }]}>Nguyên liệu chính</Text>
                    <View style={styles.ingredientList}>
                        {dish.ingredients.map((ing) => (
                            <View key={ing.id} style={styles.ingredientItem}>
                                <View style={styles.dot} />
                                <Text style={{ flex: 1, fontSize: 15 }}>{ing.name}</Text>
                                <Text style={{ fontWeight: 'bold', color: '#666' }}>{ing.amount} {ing.unit}</Text>
                            </View>
                        ))}
                    </View>

                    <DishReviews dishId={dishId}/>
                    
                </ScrollView>
            </View>

            {/* 3. FOOTER: ĐẶT HÀNG */}
            <View style={styles.footer}>
                {mode === 'order' ? <>
                    <QuantityChange 
                    quantity={quantity}
                    increaseQty={increaseQty}
                    decreaseQty={decreaseQty}
                />
                
                <MyButton 
                    loading={loading}
                    btnLabel={`Thêm • ${(parseInt(dish.price) * quantity).toLocaleString('vi-VN')}đ`}
                    onPress={handleAddToCart}
                />
                </>: <MyButton 
                    loading={loading}
                    btnLabel={"Chỉnh sửa"}
                    onPress={() => nav.navigate("EditDish", {"dish": dish})}
                />}
            </View>
        </View>
    );
};

export default DishDetail;

const styles = StyleSheet.create({
    headerContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerButtons: {
        position: 'absolute',
        top: 40,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    dishName: {
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    dishPrice: {
        fontWeight: 'bold',
        color: '#ee6a0dff',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: 5,
        color: '#666',
        fontSize: 13,
    },
    chefRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        color: '#666',
        lineHeight: 22,
    },
    ingredientList: {
        marginTop: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between'
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ee6a0dff',
        marginRight: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center"
    },
});