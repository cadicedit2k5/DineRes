import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, IconButton, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { authApis, endpoints } from '../../utils/Apis'; 
import GoBack from '../../components/Layout/GoBack';
import MyStyles from '../../styles/MyStyles';

const PaymentHistory = () => {
    const nav = useNavigation();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);

    const loadTransactions = async () => {  
        let url = `${endpoints['transactions']}?page=${page}`;
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            if (token) {
                const res = await authApis(token).get(url);
                
                if (!res.data.next) {
                    setPage(0);
                }

                if (page === 1)  {
                    setTransactions(res.data.results);
                }else if (page > 1) {
                    setTransactions([...transactions, ...res.data.results]);
                }
            }

        } catch (error) {
            console.error(error.response.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (page > 0) {
            loadTransactions();
        }
    }, [page]);


    const loadMore = () => {
        if (page > 0 && !loading) {
            setPage(page+1);
        }
    };

    const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return { color: '#f09c15ff', backgroundColor: '#fdf3e5' };
        case 'success':
            return { color: '#12a467ff', backgroundColor: '#89f7be9e' };
        case 'failed':
            return { color: '#ff5252', backgroundColor: '#ffebee' };
        }
    };

    const getMethodInfo = (method) => {
        switch (method.toLowerCase()) {
            case 'momo':
                return { label: 'MoMo', icon: 'wallet', color: '#A50064', bg: '#FCE4EC' };
            case 'zlpay':
                return { label: 'ZaloPay', icon: 'qrcode-scan', color: '#0068FF', bg: '#E3F2FD' };
            case 'cash':
            default:
                return { label: 'Tiền mặt', icon: 'cash', color: '#4CAF50', bg: '#E8F5E9' };
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <GoBack />

            <View style={styles.statsContainer}>
                <Text variant="titleMedium" style={MyStyles.title}>Lịch sử giao dịch</Text>
            </View>

            <FlatList
                data={transactions}
                keyExtractor={(item, key) => item.id.toString() + key}
                
                contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={(loading && transactions.length > 0) && <ActivityIndicator size="large" />}
                
                ListEmptyComponent={!loading && (
                    <Text style={{textAlign: 'center', marginTop: 50, color: '#999'}}>Không có lịch sử thanh toán</Text>
                )}
                renderItem={({ item }) => {
                    const methodInfo = getMethodInfo(item.payment_method);
                    const statusStyle = getStatusStyle(item.status);

                    return (
                        <Surface style={styles.card} elevation={1}>
                            <View style={styles.cardHeader}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={[styles.iconBox, { backgroundColor: methodInfo.bg }]}>
                                        <IconButton icon={methodInfo.icon} iconColor={methodInfo.color} size={20} style={{margin:0}} />
                                    </View>
                                    <View style={{marginLeft: 10}}>
                                        <Text style={{fontWeight: 'bold', fontSize: 15}}>{methodInfo.label}</Text>
                                        <Text style={{fontSize: 12, color: '#888'}}>Mã GD: #{item.id}</Text>
                                    </View>
                                </View>
                                <Text style={{fontSize: 12, color: '#666'}}>{moment(item.paid_at).format("HH:mm - DD/MM/YYYY")}</Text>
                            </View>

                            <Divider style={{marginVertical: 10}} />

                            <View style={styles.cardBody}>
                                <View>
                                    <Text style={{fontSize: 12, color: '#666'}}>Đơn hàng gốc</Text>
                                    <Text style={{fontWeight: 'bold', color: '#333'}}>Order #{item.order}</Text>
                                </View>
                                <View style={{alignItems: 'flex-end'}}>
                                    <Text style={{fontSize: 12, color: '#666'}}>Số tiền</Text>
                                    <Text variant="titleMedium" style={MyStyles.price}>
                                        {item.amount ? parseInt(item.amount).toLocaleString('vi-VN') : 0}đ
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={[statusStyle, styles.transactionStatus]}>{item.status}</Text>
                            </View>
                        </Surface>
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default PaymentHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    transactionStatus: {
        padding: 8,
        fontSize: 12,
        fontWeight: "bold",
        borderRadius: 10
    }
});