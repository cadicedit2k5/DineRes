import { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, RadioButton, Icon, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../utils/Apis';
import MyStyles from '../../styles/MyStyles';
import GoBack from '../../components/Layout/GoBack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyButton from '../../components/Layout/MyButton';
import * as Linking from "expo-linking"
import { ViewModeContext } from '../../utils/contexts/MyContexts';

const Payment = () => {
    const route = useRoute();
    const nav = useNavigation();
    const { orderId, totalAmount } = route.params || {};
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [isCustomerView] = useContext(ViewModeContext);

    const redirectUrl = Linking.createURL('payment-result')

    const methods = [
        { 
            value: 'momo', 
            label: 'Ví MoMo', 
            icon: 'wallet',
            color: '#A50064',
            desc: 'Thanh toán MoMo'
        },
        { 
            value: 'zlpay', 
            label: 'ZaloPay', 
            icon: 'qrcode-scan', 
            color: '#0085FF',
            desc: 'Thanh toán qua ví ZaloPay'
        },
        // { 
        //     value: 'paypal', 
        //     label: 'PayPal', 
        //     icon: 'paypal', 
        //     color: '#003087',
        //     desc: 'Thanh toán quốc tế'
        // },
        // { 
        //     value: 'stripe', 
        //     label: 'Thẻ tín dụng (Stripe)', 
        //     icon: 'credit-card', 
        //     color: '#6772E5',
        //     desc: 'Visa, MasterCard, JCB'
        // },
    ];

    if (!isCustomerView) {
        methods.unshift({ 
            value: 'cash', 
            label: 'Thanh toán tiền mặt', 
            icon: 'cash', 
            color: '#4CAF50',
            desc: 'Thanh toán trực tiếp'
        },)
    }

    useEffect(() => {
        const handleDeepLink = (event) => {
            let url = event.url;
            console.log("App quay lại từ link:", url);
            
            if (url && url.includes('payment-result')) {
                checkPaymentStatus(); 
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        
        Linking.getInitialURL().then((url) => {
            if (url && url.includes('payment-result')) {
                checkPaymentStatus();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const checkPaymentStatus = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApis(token).get(endpoints['order-detail'](orderId));
            
            console.log(res.data);

            if (res.data.status === 'paid') {
                Alert.alert("Thành công", "Thanh toán thành công!", [
                    { text: "Về trang chủ", onPress: () => nav.navigate("Home") }
                ]);
            } else {
                Alert.alert("Thông báo", "Giao dịch đang xử lý hoặc chưa hoàn tất.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!orderId) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin đơn hàng");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            
            const res = await authApis(token).post(endpoints['payments'], {
                "order_id": orderId,
                "payment_method": paymentMethod,
                "redirect_url": redirectUrl
            });

            if (paymentMethod === 'cash') {
                Alert.alert("Thành công", "Thanh toán thành công!", [
                    { text: "Về trang chủ", onPress: () => nav.navigate("Home") }
                ]);
            }

            const data =res.data;
            if (data.payUrl) {
                await Linking.openURL(data.payUrl);
            }

        } catch (error) {
            console.error(error.response.data);
            Alert.alert("Lỗi", "Thanh toán thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <GoBack title="Thanh toán" />
            
            <ScrollView contentContainerStyle={{ padding: 20 }}>

                <Surface style={styles.summaryCard} elevation={2}>
                    <Text style={{ color: '#666' }}>Tổng thanh toán</Text>
                    <Text variant="displayMedium" style={MyStyles.price}>
                        {parseInt(totalAmount || 0).toLocaleString('vi-VN')}đ
                    </Text>
                    <View style={styles.rowBetween}>
                        <Text>Mã đơn hàng:</Text>
                        <Text style={{ fontWeight: 'bold' }}>#{orderId}</Text>
                    </View>
                </Surface>

                <Text variant="titleMedium" style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

                <RadioButton.Group 
                    onValueChange={newValue => setPaymentMethod(newValue)} 
                    value={paymentMethod}>
                    {methods.map((method) => (
                        <TouchableOpacity 
                            key={method.value} 
                            style={[
                                styles.methodItem, 
                                paymentMethod === method.value && styles.selectedMethod
                            ]}
                            onPress={() => setPaymentMethod(method.value)}
                        >
                            <View style={styles.methodLeft}>
                                <Icon source={method.icon} size={30} color={method.color} />
                                <View style={{ marginLeft: 15 }}>
                                    <Text style={styles.methodLabel}>{method.label}</Text>
                                    <Text variant="bodySmall" style={{ color: '#888' }}>{method.desc}</Text>
                                </View>
                            </View>
                            <RadioButton value={method.value} color="#ee6a0dff" />
                        </TouchableOpacity>
                    ))}
                </RadioButton.Group>

            </ScrollView>

            {/* 3. FOOTER BUTTON */}
            <View style={styles.footer}>
                <MyButton
                    btnLabel={"Thanh toán"}
                    loading={loading}
                    onPress={handlePayment}
                />
            </View>
        </SafeAreaView>
    );
};

export default Payment;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f3f398',
    },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 25,
    },
    rowBetween: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5
    },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    selectedMethod: {
        borderColor: '#ee6a0dff',
        backgroundColor: '#fff8f0'
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodLabel: {
        fontWeight: 'bold',
        fontSize: 16
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    payButton: {
        backgroundColor: '#ee6a0dff',
        borderRadius: 10
    }
});