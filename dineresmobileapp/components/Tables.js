import { useContext, useEffect, useState } from "react";
import Apis, { endpoints } from "../utils/Apis";
import { FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, HelperText, List, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MyUserContext } from "../utils/contexts/MyContexts";
import ForceLogin from "./Layout/ForceLogin";

const Tables = () => {
    const [tables, setTables] = useState([]);
    const [date, setDate] = useState(new Date());
    const [bookingtime, setBookingtime] = useState("");
    const [user, ] = useContext(MyUserContext);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [searched, setSearched] = useState(false);
    const [timeError, setTimeError] = useState("");

    const nav = useNavigation()
    let tabBarHeight = 0;

    try {
        tabBarHeight = useBottomTabBarHeight();
    } catch (ex) {
        tabBarHeight = 0;
    }

    const loadTables = async () => {
        try{
            setLoading(true);
            let url = `${endpoints['tables']}?page=${page}`;
            if (bookingtime)
                url = `${url}&booking_time=${bookingtime}`;

            console.info(url);

            let res = await Apis.get(url);
            if (!res.data.next)
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

    const validate = (date) => {
        const now = new Date();
        if (date < now) {
            setTimeError("Không thể chọn thời gian trong quá khứ");
            return false;
        }
        setTimeError("");
        return true;
    }

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
        setTables([]);
        setPage(1);
        setSearched(false);
    }, [bookingtime]);

    const loadMore = () => {
        if (page > 0 && !loading && tables.length > 0)
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

            <HelperText type="error" visible={!!timeError}>
                {timeError}
            </HelperText>

           {Platform.OS === "android" && showPicker && (
                <DateTimePickerModal
                    isVisible
                    mode="datetime"
                    date={date}
                    onConfirm={(d) => {
                        validate(d);
                        setShowPicker(false);
                        setDate(d);
                        setBookingtime(formatLocalDateTime(d));
                    }}
                    onCancel={() => setShowPicker(false)}
                />
            )}

            {Platform.OS === "ios" && showPicker && (
                <Portal>
                    <DateTimePickerModal 
                    isVisible={showPicker} 
                    mode="datetime" date={date} 
                    display="inline"
                    onConfirm={(d) => { 
                        validate(d);
                        setShowPicker(false);
                        setDate(d); 
                        setBookingtime(formatLocalDateTime(d));
                    }} 
                    onCancel={() => setShowPicker(false)} /> 
                </Portal>
            )}

            {!user ? ( <ForceLogin /> ) :
                (
                    <TouchableOpacity
                        onPress={onSearch}
                        disabled ={ loading || !bookingtime || !!timeError }
                        style={[ style.button, (loading || !bookingtime || !!timeError) && {backgroundColor: "#ccc"} ]}>

                        {loading ? ( <ActivityIndicator color="#fff" />) : (
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>
                                Tìm bàn trống
                            </Text>
                        )}
                    </TouchableOpacity>
                )
            }

            <FlatList 
                data={tables} 
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                contentContainerStyle={{ paddingBottom: tabBarHeight + 200 }}
                ListFooterComponent={loading && <ActivityIndicator size="large" /> }
                renderItem={({ item }) => (<List.Item
                    style={style.item}
                    title={item.name}
                    description={`Số chỗ ngồi: ${item.capacity} chỗ`}
                    left={() => <Image source={require("../assets/DineResLoGo.png")} style={style.avatar} />}
                    right={() => (<TouchableOpacity
                                        style={style.bookBtn}
                                        onPress={() => nav.navigate("Booking", {
                                                                                table: item,
                                                                                booking_time: bookingtime
                                                                            })}>
                                        <Text style={style.bookText}>Đặt bàn</Text>
                                    </TouchableOpacity>)}
                />)} />
        </View>
    );
};

export default Tables;

const style = StyleSheet.create ({
    padding: {
        padding: 16
    },
    heading: {
        fontSize: 15, 
        fontWeight: "bold"
    },
    button: {
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
        marginVertical: 6,
        marginHorizontal: 2,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    avatar: {
        width: 60,
        height: 60,
        marginLeft: 12,
        marginTop: 8,
        borderRadius: 8
    },
})