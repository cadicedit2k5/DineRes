import { Alert, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from '../../components/Layout/GoBack'
import ListOrderDetail from '../../components/ListOrderDetail'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Text } from 'react-native'
import MyStyles from '../../styles/MyStyles'
import MyButton from '../../components/Layout/MyButton'
import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApis, endpoints } from '../../utils/Apis'

const OrderDetail = () => {
    const route = useRoute();
    const {order, payOrder, cancelOrder} = route?.params;
    const [details, setDetails] = useState(order.details);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();

    const handleUpdate = () => {
        Alert.alert("Thông báo", "Chắc chắc thay đổi?",
            [
                {
                    text: "Hủy",
                },{
                    text: "Ok",
                    onPress: updateOrder,
                }
            ]
        )
    }

    const updateOrder = async () => {
        try {
            setLoading(true);
            const data = [];
            for (let detail of details) {
                data.push({
                    "dish_id": detail.dish_id,
                    "quantity": detail.quantity,
                })
            }

            console.log(data)
            const token = await AsyncStorage.getItem("access-token");
            if (token) {
                const res = await authApis(token).patch(endpoints["order-detail"](order.id),
                    {"details": data},
                )

                if (res.status === 200) {
                    Alert.alert("Thông báo", "Cập nhật thành công");
                    nav.navigate("Orders");
                }
            }
        } catch (error) {
            console.info(error.response.data);
        }finally{
            setLoading(false);
        }
    }

    const getTotalPrice = () => {
        if (details) {
            return details.reduce((total, item) => {
                return total + (Number(item.price_at_order) * item.quantity);
            }, 0);
        }
        return 0;
    };
  return (
    <SafeAreaView style={{flex: 1}}>
        <GoBack />
        <ListOrderDetail details={details} setDetails={setDetails}/>

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
                {order.status === 'pending' &&<>
                <View style={{ flex: 1 }}>
                    <MyButton
                        btnLabel="Hủy"
                        loading={loading}
                        onPress={cancelOrder}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <MyButton 
                        btnLabel="Cập nhật"
                        loading={loading}
                        onPress={handleUpdate}
                    />
                </View>
                </>}

                {order.status === 'done' && <View style={{ flex: 1 }}>
                    <MyButton
                        btnLabel="Thanh toán"
                        loading={loading}
                        onPress={() => payOrder(order)}
                    />
                </View>}
                
                
            </View>
        </View>
    </SafeAreaView>
  )
}

export default OrderDetail

const styles = StyleSheet.create({
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