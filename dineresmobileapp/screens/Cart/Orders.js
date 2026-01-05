import { FlatList, StyleSheet, Text, View} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from '../../components/Layout/GoBack'
import { ActivityIndicator, Button, Icon } from 'react-native-paper'
import MyStyles from '../../styles/MyStyles'
import { useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApis, endpoints } from '../../utils/Apis'
import moment from 'moment'
import "moment/locale/vi"
import { useNavigation } from '@react-navigation/native'
import { MyUserContext, ViewModeContext } from '../../utils/contexts/MyContexts'
import MyButton from '../../components/Layout/MyButton'

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [isCustomerView] = useContext(ViewModeContext);
    const [user, ] = useContext(MyUserContext);
    const nav = useNavigation();

    const loadOrder = async () => {
        let url;
        if (isCustomerView) {
            url = `${endpoints['user-orders']}?page=${page}`;
        }else {
            url = `${endpoints['orders']}?page=${page}`;
        }
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            
            if (token) {
                const res = await authApis(token).get(url);

                if (!res.data.next) {
                    setPage(0);
                }

                if (page === 1) {
                    setOrders(res.data.results);
                }else if (page > 1) {
                    setOrders([...orders, ...res.data.results]);
                }
            }
        } catch (error) {
            console.error(error);
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let timer = setTimeout(() => {
            if (page > 0) {
                loadOrder();
            }
        }, 500);
        return (() => clearTimeout(timer));
    }, [page])

    const loadMore = () => {
        if (page > 0 && orders.length > 0) {
            setPage(page + 1);
        }
    }

    const cancelOrder= async () => {

    }

    const doneOrder = async() => {

    }

    const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return { color: '#f09c15ff', backgroundColor: '#fdf3e5' };
        case 'paid':
            return { color: '#2196f3', backgroundColor: '#e3f2fd' };
        case 'done':
            return { color: '#12a467ff', backgroundColor: '#89f7be9e' };
        case 'cancel':
            return { color: '#ff5252', backgroundColor: '#ffebee' };
        }
    };
  return (
    <SafeAreaView style={{backgroundColor: "white", flex: 1}}>
        <GoBack />
        <Text style={MyStyles.title}>Orders</Text>
        {(orders.length === 0 && !loading) && 
        <Text
            style={{
                fontWeight: "bold",
                fontSize: 16,
                color: "#ff5252",
                backgroundColor: '#ffebee',
                borderColor: "#ff5252b0",
                borderWidth: 1,
                borderRadius: 10,
                padding: 20,
                margin: 20
            }}
        >Không có Order nào</Text>}

        <FlatList
            data={orders}
            onEndReached={loadMore}
            ListFooterComponent={loading && <ActivityIndicator size="large" />}
            renderItem={({item, key}) => {
                const statusStyle = getStatusStyle(item.status);

                return (<View key={key} style={styles.orderContainer}> 
                    <Icon size={40} color='#f09c15ff' source="pot-steam"/>
                    <View style={{flex: 1, marginLeft: 10,}}>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}>
                            <Text style={styles.orderSubTitle}>Order ID: #{item.id}</Text>
                            <Text style={[styles.orderStatus, statusStyle]}>{(item.status).toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text>{item.details.length} món</Text>
                            <Text>{moment(item.created_date).format('lll')}</Text>
                            <Text style={{fontWeight: "bold", marginRight: 8}}>Tong tien: <Text style={MyStyles.price}>{parseInt(item.total_amount).toLocaleString('vi-VN')}đ</Text></Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 10
                        }}>

                            {(item.status === 'pending') && 
                            <Button
                                mode='contained-tonal'
                                onPress={cancelOrder}
                                style={{backgroundColor: "#ff5252"}}
                            >Hủy</Button>}

                            {(user.user_role == 'chef' && item.status === 'pending')&&
                            <Button
                                mode='contained-tonal'
                                onPress={doneOrder}
                                style={{ color: '#f09c15ff', backgroundColor: '#fdf3e5' }}
                            >Nấu</Button>}

                            {(item.status === 'done') && 
                            <Button
                                mode='contained-tonal'
                                onPress={() => {
                                    nav.navigate("Payment", { 
                                        orderId: item.id, 
                                        totalAmount: item.total_amount 
                                    })
                                }}
                            >Thanh toán</Button>}
                        </View>
                    </View>
                </View>)}}
            />
    </SafeAreaView>
  )
}

export default Orders

const styles = StyleSheet.create({
    orderContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 20,
        marginHorizontal: 20,
        marginVertical: 10,
        borderColor: "#dad3d3ff",
        borderWidth: 0.5,
        borderRadius: 15,
    },
    orderSubTitle: {
        fontWeight: "bold",
        fontSize: 16
    },
    orderStatus: {
        padding: 8,
        fontSize: 12,
        fontWeight: "bold",
        borderRadius: 10
    }
})