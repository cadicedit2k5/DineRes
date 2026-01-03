import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoBack from '../../components/Layout/GoBack';
import QuantityChange from '../../components/Layout/QuantityChange';
import MyButton from '../../components/Layout/MyButton';
import MyStyles from '../../styles/MyStyles';
import { Alert } from 'react-native';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadCart = async () => {
        try {
            setLoading(true);
            const items = await AsyncStorage.getItem("cart");
            setCart(JSON.parse(items));
        } catch (error) {
            console.error(error);
        }finally {
            setLoading(false);  
        }
    }

    useEffect(() => {
        loadCart();
    }, [])

    const handleOrder = async () => {
        try {
            
        } catch (error) {
            
        }
    }

    const updateCart = async (newCart) => {
        setCart(newCart);
        try {
            await AsyncStorage.setItem('cart', JSON.stringify(newCart));
        } catch (e) {
            console.error("Lỗi lưu storage", e);
        }
    };

    const increaseQuantity = (itemId) => {
        const newCart = cart.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: item.quantity + 1 };
            }
            return item;
        });
        updateCart(newCart);
    };

    const decreaseQuantity = (itemId) => {
        const newCart = cart.map(item => {
            if (item.id === itemId) {
                if (item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
            }
            return item;
        });
        updateCart(newCart);
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
                    const newCart = cart.filter(item => item.id !== itemId);
                    updateCart(newCart);
                },
            }
        ]
    );
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            return total + (Number(item.price) * item.quantity);
        }, 0);
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
            
            <View style={styles.footerContainer}>
        
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
                    onPress={() => console.log("So sánh")}
                />
            </View>
            
            <View style={{ flex: 1 }}>
                <MyButton 
                    btnLabel="Thanh toán"
                    loading={loading}
                    onPress={() => console.log("thanh toan")}
                />
            </View>
        </View>
    </View>
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