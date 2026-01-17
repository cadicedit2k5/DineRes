import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from "../../components/Layout/GoBack";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Button, Icon } from "react-native-paper";

const BookingDetail = () => {
    const route = useRoute();
    const { booking } = route.params;
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(booking.status);
    const nav = useNavigation();
    

    const updateStatus = async (newStatus) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");

            const res = await authApis(token).patch(
                `${endpoints['bookings']}${booking.id}/update-status/`,
                { status: newStatus }
            );

             if (res.status === 200)
                setStatus(newStatus);
                Alert.alert("Thông báo:", "Thay đổi thành công");
                nav.goBack();

        } catch (err) {
            console.info(err.response.data);
            Alert.alert(err.response.data.message);
        } finally {
            setLoading(false)
        };
    };
    
    const renderActions = () => {
        switch (status) {
            case "confirmed":
                return (
                    <>
                        <Button
                            mode="contained"
                            onPress={() => updateStatus("dining")}
                            disabled={loading}
                        >
                            Khách vào bàn
                        </Button>

                        <Button
                            mode="outlined"
                            textColor="red"
                            onPress={() => updateStatus("cancelled")}
                            disabled={loading}
                        >
                            Huỷ
                        </Button>
                    </>
                );

            case "dining":
                return (
                    <Button
                        mode="contained"
                        onPress={() => updateStatus("completed")}
                        disabled={loading}
                    >
                        Hoàn tất
                    </Button>
                );

            default:
                return (
                    <Text style={styles.doneText}>
                        Đơn đặt bàn đã kết thúc
                    </Text>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <GoBack />

            <View style={styles.card}>
                <Text style={styles.title}>Chi tiết đặt bàn</Text>

                <View style={styles.infoRow}>
                    <Icon source="table-furniture" size={20} color="#2e0a0aff" />
                    <Text style={styles.infoText}>
                        {booking.table.name}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon source="account-group" size={18} color="#3c263aff" />
                    <Text style={styles.infoText}>
                        Sức chứa: {booking.table.capacity}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon source="clock-outline" size={18} color="#2eaadaff" />
                    <Text style={styles.infoText}>
                        Thời gian: {booking.booking_time}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon source="clock-outline" size={18} color="#2eaadaff" />
                    <Text style={styles.infoText}>
                        Ghi chú: {booking.note}
                    </Text>
                </View>

                <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Trạng thái</Text>
                    <Text style={styles.status}>{status.toUpperCase()}</Text>
                </View>

                {loading && <ActivityIndicator />}

                <View style={styles.actions}>
                    {renderActions()}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default BookingDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },

    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        elevation: 3,
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },

    statusBox: {
        marginVertical: 12,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#f3f3f3",
    },

    statusLabel: {
        fontSize: 12,
        color: "#777",
    },

    status: {
        fontSize: 16,
        fontWeight: "bold",
    },

    actions: {
        marginTop: 16,
        gap: 10,
    },

    doneText: {
        textAlign: "center",
        color: "#4CAF50",
        fontWeight: "600",
        marginTop: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },

    infoText: {
        marginLeft: 8,
        fontSize: 15,
    },
});