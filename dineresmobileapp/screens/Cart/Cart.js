import { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoBack from '../../components/Layout/GoBack';
import QuantityChange from '../../components/Layout/QuantityChange';
import MyButton from '../../components/Layout/MyButton';
import MyStyles from '../../styles/MyStyles';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApis, endpoints } from '../../utils/Apis';
import { MyCartContext, MyUserContext, ViewModeContext } from '../../utils/contexts/MyContexts';
import UserFind from '../../components/UserFind';
import ForceLogin from '../../components/Layout/ForceLogin';

const Cart = () => {
    const [user, ] = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const [takeAway, setTakeWay] = useState(true);
    const [isCustomerView, ] = useContext(ViewModeContext);
    const [customer, setCustomer] = useState(null);
    const [visible, setVisible] = useState(false);
    const [cart, cartDispatch] = useContext(MyCartContext);
    const nav = useNavigation();

    const validateOrder = () => {
        if (!cart || cart.length === 0) {
            Alert.alert("Thông báo", "Chưa có món ăn nào!!!");
            return false;
        }
        return true;
    }

    const handleOrder = async () => {
        if (validateOrder()) {
            const details = [];
            for (let item of cart) {
                details.push({
                    "dish_id": item.id,
                    "quantity": item.quantity
                })
            }
            console.info(details);
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("access-token");

                if (token) {
                    const res = await authApis(token).post(endpoints['orders'],
                        {
                            "customer_id": customer ? customer.id : null,
                            "take_away": takeAway,
                            "details": details
                        }
                    );

                    if (res.status === 201) {
                        Alert.alert("Thông báo", "Đã đặt thành công!!!");
                        cartDispatch({
                            type: "clear",
                        })
                        nav.goBack();
                    }
                }
            } catch (error) {
                console.error(error.response.data);
                Alert.alert("Thông báo", error.response.data.message, [
                    {
                        text: "Đặt bàn ngay",
                        onPress: () => nav.navigate("Home", {screen: "Table"})
                    }
                ])
            }finally {
                setLoading(false);
            }
        }
    }

    const increaseQuantity = (itemId) => {
        const dish = cart.find(item => item.id === itemId);
        if (dish) {
            cartDispatch({
                type: "update",
                payload: {
                    id: itemId,
                    quantity: dish.quantity + 1,
                },
            })
        }
    };

    const decreaseQuantity = (itemId) => {
        const dish = cart.find(item => item.id === itemId);
        if (dish && dish.quantity > 1) {
            cartDispatch({
                type: "update",
                payload: {
                    id: itemId,
                    quantity: dish.quantity - 1,
                },
            })
        }
    };

    const removeItem = (itemId) => {
        Alert.alert(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa món ăn này khỏi giỏ hàng không?",
        [
            {
                text: "Hủy",
                onPress: () => console.log("Hủy xóa"),
            },

            {
                text: "Xóa",
                onPress: () => {
                    cartDispatch({
                        type: "remove",
                        payload: {
                            id: itemId,
                        }
                    })
                },
            }
        ]
    );
    };

    const getTotalPrice = () => {
        if (cart) {
            return cart.reduce((total, item) => {
                return total + (Number(item.price) * item.quantity);
            }, 0);
        }
        return 0;
    };

    return (
        <SafeAreaView style={styles.cartContainer}>
            <GoBack/>
            <FlatList
                data={cart}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <Image 
                            source={{ uri: item.image }}
                            style={styles.cartItemImage}
                            resizeMode="cover"
                        />

                        <View style={{ flex: 1 }}>
                            
                            <View style={styles.cartItemHeader}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 5 }} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text style={{ fontWeight: 'bold', color: '#ee6a0dff' }}>
                                    {parseInt(item.price).toLocaleString()}đ
                                </Text>
                            </View>
                            
                            <View style={styles.cartItemFooter}>
                                <QuantityChange 
                                    quantity={item.quantity}
                                    increaseQty={() => increaseQuantity(item.id)}
                                    decreaseQty={() => decreaseQuantity(item.id)}
                                />
                                
                                <View>
                                    <Button 
                                        mode='contained-tonal' 
                                        onPress={() => removeItem(item.id)}
                                        labelStyle={{ fontSize: 12 }}
                                        compact
                                    >
                                        Xóa
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            />

            <UserFind
                setCustomer={setCustomer}
                visible={visible}
                setVisible={setVisible} />
            
            {!user ? <ForceLogin /> : 
            <View style={styles.footerContainer}>
                {!isCustomerView && 
                <View style={{flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10}}>
                    <Text
                        style={{fontWeight: "bold",
                             color: "#e46921ff"}}
                    >Khách hàng</Text>
                    <Text>{customer? customer.first_name + customer.last_name :""}</Text>
                    <Button mode='outlined' onPress={() => setVisible(true)}>Chọn</Button>
                </View>}

                <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Hình thức dùng bữa:</Text>
                    <SegmentedButtons
                        value={takeAway}
                        onValueChange={setTakeWay}
                        buttons={[
                            {
                                value: false,
                                label: 'Ăn tại chỗ',
                                icon: 'silverware-fork-knife',
                            },
                            {
                                value: true,
                                label: 'Mang đi',
                                icon: 'bag-personal', 
                            },
                        ]}
                        density="medium"
                    />
                </View>

                <View style={styles.totalContainer}>
                    <Text style={MyStyles.subTitle}>
                        Tổng cộng:
                    </Text>
                    <Text style={MyStyles.price}>
                        {getTotalPrice().toLocaleString()} VNĐ
                    </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <MyButton
                            btnLabel="So sánh"
                            loading={loading}
                            onPress={() => nav.navigate("CompareDish", {"dishes": cart})}
                        />
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <MyButton 
                            btnLabel="Đặt ngay"
                            loading={loading}
                            onPress={handleOrder}
                        />
                    </View>
                </View>
            </View>}
        </SafeAreaView>
    );
};

export default Cart;

const styles = StyleSheet.create({
    cartContainer: {
        flex: 1,
        backgroundColor: "#fff"
    },cartItem : { 
        marginBottom: 20, 
        padding: 10, 
        borderBottomWidth: 1, 
        borderColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center'
    },cartItemImage:{
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: '#eee'
    }, cartItemHeader: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        marginBottom: 5
    },
    cartItemFooter: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: "space-between",
        marginTop: 5
    },

    footerContainer: {
        marginTop: 10,
        padding: 20,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 0,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0', 
    },
    totalContainer: {
        marginVertical: 15,
        borderColor: "#888",
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: '#fafafa'
    }
})