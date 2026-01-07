import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import GoBack from "../../components/Layout/GoBack";
import { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from 'react-native-safe-area-context'



const Booking = () => {
    const route = useRoute();
    const nav = useNavigation();

    const { table, booking_time } = route.params;
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");

            const res =await authApis(token).post(endpoints['bookings'], {
                "booking_time": booking_time,
                "note": note,
                "table": table.id,
            });
            if (res.status === 201)
                Alert.alert("Thông báo:", "Đặt bàn thành công!");
                nav.goBack();
        } catch (ex) {
            console.error(ex);
            Alert.alert("Cảnh báo:", "Đặt bàn thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <GoBack />

                    <Text style={styles.title}>Xác nhận đặt bàn</Text>

                    <View style={styles.card}>
                        <Image source={require("../../assets/DineResLoGo.png")} style={styles.image} />
                        <Text style={styles.label}>Bàn</Text>
                        <Text style={styles.value}>{table.name}</Text>

                        <Text style={styles.label}>Sức chứa</Text>
                        <Text style={styles.value}>{table.capacity} chỗ</Text>

                        <Text style={styles.label}>Thời gian</Text>
                        <Text style={styles.value}>{booking_time}</Text>
                    </View>

                    <TextInput
                        style={[styles.input, styles.noteInput]}
                        placeholder="Ghi chú (không bắt buộc)"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={loadBooking}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Đang đặt bàn..." : "Xác nhận đặt bàn"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
        
    );
};

export default Booking;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16
    },

    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4
    },

    label: {
        fontSize: 14,
        color: "#888",
        marginTop: 8
    },

    value: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 2
    },

    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 12
    },

    noteInput: {
        height: 80,
        textAlignVertical: "top"
    },

    button: {
        backgroundColor: "#2196F3",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    image: {
        width: 80,
        height: 80,
        alignSelf: "center",
        marginBottom: 12,
        borderRadius: 12
    }
});