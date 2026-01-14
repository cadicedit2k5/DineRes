import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from "../../components/Layout/GoBack";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";
import { ActivityIndicator, Icon } from "react-native-paper";

const BookingHistory = () =>{
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1)
    const [booking, setBooking] = useState([])

    const loadBookingHistoty = async() => {
        try {
            setLoading(true)
            let url = `${endpoints['user-bookings']}?page=${page}`;
            const token = await AsyncStorage.getItem('access-token');
            console.info(url)
            const res = await authApis(token).get(url)
            if (!res.data.next)
                setPage(0);
            if (page === 1)
                setBooking(res.data.results);
            if (page > 1)
                setBooking([...booking, ...res.data.results])

        } catch (ex) {
            console.error(ex)
        } finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        if (page > 0)
            loadBookingHistoty();
    }, [page]);

    const loadMore = () => {
        if (page > 0 && !loading)
            setPage(page + 1);
    }

    const formatDateTime = (iso) => {
        const d = new Date(iso);
        const pad = (n) => n.toString().padStart(2, "0");

        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
            `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    };

    const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return { backgroundColor: "#5b0ae5ff" };
        case 'dining':
            return { backgroundColor: "#FF9800" };
        case 'completed':
            return { backgroundColor: "#4CAF50" };
        case 'cancelled':
            return { backgroundColor: "#ef1a0bff" };
        }
    };

    return(
        <SafeAreaView style={{ flex: 1}}>
            <GoBack />
            <View>
                <Text style={MyStyles.title}>Lịch sử đặt bàn</Text>
                <FlatList 
                    data={booking}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={ loading && <ActivityIndicator size='large'/> }
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => {
                        const statusStyle = getStatusStyle(item.status)
                        return (
                            <View style={styles.card}>
                                <View style={styles.header}>
                                    <View style={styles.row}>
                                        <Icon source="table-furniture" size={20} color="#2e0a0aff"/>
                                        <Text style={styles.tableName}>
                                            { item.table.name }
                                        </Text>
                                    </View>

                                    <View style={[styles.statusBadge, statusStyle]}>
                                        <Text style={styles.statusText}>
                                            { item.status.toUpperCase() }
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Icon source="account-group" size={18} color="#3c263aff" />
                                    <Text style={styles.info}>
                                        { item.table.capacity } chỗ
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Icon source="clock-outline" size={18} color="#2eaadaff" />
                                    <Text style={styles.info}>
                                        {formatDateTime(item.booking_time)}
                                    </Text>
                                </View>

                                {item.note ? (
                                    <View style={styles.row}>
                                        <Icon source="note-text-outline" size={18} color="#705656ff" />
                                        <Text style={styles.note}>{item.note}</Text>
                                    </View>
                                ) : null}
                            </View>
                        );
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

export default BookingHistory;

const styles = StyleSheet.create({
  card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 14,
        borderRadius: 12,
        elevation: 2,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 4,
    },

    tableName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },

    info: {
        fontSize: 14,
        color: "#555",
    },

    note: {
        fontSize: 14,
        color: "#444",
        flex: 1,
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },

    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    listContainer: {
        paddingBottom: 100,
  },
});