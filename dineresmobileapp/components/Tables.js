import { useEffect, useState } from "react";
import Apis, { endpoints } from "../utils/Apis";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ActivityIndicator, List } from "react-native-paper";

const Tables = () => {
    const [tables, setTables] = useState([]);
    const [date, setDate] = useState(new Date());
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [bookingtime, setBookingtime] = useState("")
    const [searched, setSearched] = useState(false);
    const loadTables = async () => {
        try{
            setLoading(true);
            let url = `${endpoints['tables']}?page=${page}`;
            if (bookingtime)
                url = `${url}&booking_time=${bookingtime}`;

            console.info(url);

            let res = await Apis.get(url);
            if (res.data.next === null)
                setPage(0);
            if (page === 1)
                setTables(res.data.results);
            if (page > 1)
                setTables([...tables, ...res.data.results]);

        } catch (ex){
            console.error(ex)
        } finally{
            setLoading(false)
        }
    }

    const formatLocalDateTime = (date) => {
        const pad = (n) => n.toString().padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

   const onSearch = () => {
        setTables([]);
        setPage(1);
        setSearched(true);
    };

    useEffect(() => {
        if (searched && page > 0)
            loadTables();
    }, [page, searched]);

    useEffect(() => {
        setPage(1);
        setSearched(false);
    }, [bookingtime]);

    const loadMore = () => {
        if (page > 0 && !loading)
            setPage(page + 1);
    }

    return (
        <View style={style.padding}>
            <Text style={style.heading}>Tìm bàn trống</Text>
            <TouchableOpacity
                style={style.input}
                onPress={() => setShowPicker(true)}>
                <Text>
                    {date.toLocaleDateString()} - {date.toLocaleTimeString()}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate){
                            setDate(selectedDate);
                            setBookingtime(formatLocalDateTime(selectedDate))
                        } 
                    }}/>)}

            <TouchableOpacity 
                onPress={onSearch}
                style={style.button}
            >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Tìm bàn trống
                </Text>
            </TouchableOpacity>

            <FlatList 
                ListFooterComponent={loading && <ActivityIndicator size="large" /> }
                onEndReached={loadMore} 
                data={tables} 
                renderItem={({ item }) => <List.Item
                    title={item.name}
                    description={`Số chỗ ngồi: ${item.capacity} chỗ`}
                    left={() => <Image source={require("../assets/DineResLoGo.png")} style={style.avatar} />}
                    right={() => (<TouchableOpacity
                                        style={style.bookBtn}
                                        onPress={() => console.log("Book table:", item.id)}>
                                        <Text style={style.bookText}>Đặt bàn</Text>
                                    </TouchableOpacity>)}
                />} />
        </View>
    );
};

export default Tables;

const style = StyleSheet.create ({
        padding: {
        padding: 16
    },
    heading: {
        fontSize: 18, 
        fontWeight: "bold"
    },
    button: {
        marginTop: 12,
        backgroundColor: "#2196F3",
        padding: 12,
        borderRadius: 8,
        alignItems: "center"
    },
    input: {
        marginTop: 12,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8
    },
    bookBtn: {
        backgroundColor: "#2196F3",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: "center",
        marginRight: 12
    },

    bookText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14
    },
    item: {
        backgroundColor: "#fff",
        marginBottom: 8,
        borderRadius: 10,
        elevation: 2,          // Android shadow
        shadowColor: "#000",   // iOS shadow
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    avatar: {
        width: 60,
        height: 60,
        marginLeft: 12,
        marginTop: 8,
        borderRadius: 8
    },
})