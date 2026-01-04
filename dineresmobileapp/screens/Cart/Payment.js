import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, RadioButton, Icon, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../utils/Apis';
import MyStyles from '../../styles/MyStyles';
import GoBack from '../../components/Layout/GoBack';
import { Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyButton from '../../components/Layout/MyButton';

const Payment = () => {
    const route = useRoute();
    const nav = useNavigation();
    const { orderId, totalAmount } = route.params || {};
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);

    const methods = [
        { 
            value: 'cash', 
            label: 'Thanh toán tiền mặt', 
            icon: 'cash', 
            color: '#4CAF50',
            desc: 'Thanh toán trực tiếp cho shipper'
        },
        { 
            value: 'momo', 
            label: 'Ví MoMo', 
            icon: 'wallet',
            color: '#A50064',
            desc: 'Thanh toán qua ứng dụng MoMo'
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
            });

            if (res.status === 201 || res.status === 200) {
                if (res.data.payUrl) {
                        Linking.openURL(res.data.payUrl);
                        Alert.alert("Chuyển hướng", "Đang chuyển sang cổng thanh toán...");
                    } else {
                         Alert.alert("Thông báo", "Yêu cầu thanh toán đã được gửi.");
                    }
            }
        } catch (error) {
            console.error(error.response.data.message);
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