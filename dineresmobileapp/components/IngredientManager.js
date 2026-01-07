import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { Text, TextInput, Button, IconButton, Modal, Portal, Searchbar, Surface, Divider, ActivityIndicator } from "react-native-paper";
import Apis, {endpoints} from "../utils/Apis";
import InputText from "./Layout/InputText";

const IngredientManager = ({ ingredients, setIngredients }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIng, setSelectedIng] = useState(null);
    const [inputAmount, setInputAmount] = useState("");

    const searchIngredients = async () => {
        let url = `${endpoints['ingredients']}?page=${page}`

        if (q) {
            url = `${url}&q=${q}`
        }
        try {
            setLoading(true);
            const res = await Apis.get(url);

            if (!res.data.next) {
                setPage(0);
            }

            if (page === 1) {
                setSearchResults(res.data.results);
            }
            else if (page > 1) {
                setSearchResults([...searchResults, ...res.data.results]);
            }
            console.log(url);
        } catch (error) {
            console.error("Lỗi tìm nguyên liệu", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            if (modalVisible && page > 0) 
                searchIngredients();
        }, 500);
        return () => clearTimeout(timer);
    }, [q, modalVisible, page]);

    useEffect(() => {
        setPage(1);
    }, [q])

    const loadMore = () => {
        if (page > 0 && searchResults.length > 0) {
            setPage(page + 1);
        }
    }

    const handleAddIngredient = () => {
        if (!selectedIng || !inputAmount) return;

        const exists = ingredients.find(i => i.id === selectedIng.id);
        if (exists) {
            Alert.alert("Thông báo", "Nguyên liệu này đã có trong món ăn rồi.");
            return;
        }

        const newIng = {
            id: selectedIng.id,
            name: selectedIng.name,
            unit: selectedIng.unit,
            amount: inputAmount
        };

        const newList = [...ingredients, newIng];
        setIngredients(newList);

        setSelectedIng(null);
        setInputAmount("");
        setModalVisible(false);
        setQ("");
    };

    const handleChangeAmount = (id, newAmount) => {
        const newList = ingredients.map(item => {
            if (item.id === id) {
                return { ...item, amount: newAmount };
            }
            return item;
        });
        setIngredients(newList);
    };

    const handleRemove = (id) => {
        Alert.alert("Cảnh báo", "Chắc chắn xóa?", 
            [
            {
                text: "Hủy",
            },

            {
                text: "Xóa",
                onPress: () => {
                    const newList = ingredients.filter(item => item.id !== id);
                    setIngredients(newList);
                },
            }
        ]
        )
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>Danh sách nguyên liệu</Text>
                <Button mode="text" icon="plus" onPress={() => setModalVisible(true)}>Thêm mới</Button>
            </View>

            {/* DANH SÁCH NGUYÊN LIỆU HIỆN TẠI */}
            {ingredients.map((item, key) => (
                <View key={key} style={styles.ingRow}>
                    <View style={{ flex: 3 }}>
                        <Text style={styles.ingName}>{item.name}</Text>
                        <Text style={styles.ingUnit}>Đơn vị: {item.unit}</Text>
                    </View>
                    
                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            mode="outlined"
                            value={String(item.amount)}
                            onChangeText={(t) => handleChangeAmount(item.id, t)}
                            keyboardType="numeric"
                            style={styles.amountInput}
                            dense
                        />
                    </View>

                    <IconButton icon="delete" iconColor="red" size={20} onPress={() => handleRemove(item.id)} />
                </View>
            ))}

            {ingredients.length === 0 && (
                <Text style={{ fontStyle: 'italic', color: '#888', textAlign: 'center', margin: 10 }}>Chưa có nguyên liệu nào.</Text>
            )}

            {/* MODAL TÌM KIẾM VÀ THÊM */}
            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text variant="titleLarge" style={{ marginBottom: 15, fontWeight: 'bold' }}>Thêm nguyên liệu</Text>
                    
                    <Searchbar
                        placeholder="Tìm tên (VD: Trứng, Bột...)"
                        onChangeText={setQ}
                        value={q}
                        style={styles.searchBar}
                    />

                    <View style={styles.resultList}>
                        <FlatList
                            data={searchResults}
                            onEndReached={loadMore}
                            keyExtractor={(item, index) => `${item.id}-${index}`}
                            ListFooterComponent={loading && <ActivityIndicator size="large"/>}
                            renderItem={({ item}) => (
                                <TouchableOpacity 
                                    style={[styles.resultItem, selectedIng?.id === item.id && styles.selectedItem]}
                                    onPress={() => setSelectedIng(item)}
                                >
                                    <Text style={{fontWeight: selectedIng?.id === item.id ? 'bold' : 'normal'}}>
                                        {item.name} ({item.unit})
                                    </Text>
                                    {selectedIng?.id === item.id && <IconButton icon="check" size={16} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    
                    {selectedIng && (
                        <View style={{ marginTop: 10 }}>
                            <InputText
                                label={`Số lượng (${selectedIng.unit})`}
                                value={inputAmount}
                                onChangeText={setInputAmount}
                                keyboardType="numeric"
                                autoFocus
                            />
                        </View>
                    )}

                    <View style={styles.modalButtons}>
                        <Button onPress={() => setModalVisible(false)} textColor="#666">Hủy</Button>
                        <Button mode="contained" onPress={handleAddIngredient} disabled={!selectedIng || !inputAmount}>
                            Thêm vào món
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
};

export default IngredientManager;

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    ingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 5,
        marginBottom: 8,
        elevation: 1
    },
    ingName: { fontWeight: 'bold', fontSize: 14 },
    ingUnit: { fontSize: 12, color: '#666' },
    amountInput: {
        flex: 1,
        backgroundColor: 'white',
        height: 35,
        fontSize: 14
    },

    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        height: '70%'
    },
    searchBar: {
        elevation: 0,
        backgroundColor: '#f0f0f0',
        marginBottom: 10
    },
    resultList: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 5,
        marginBottom: 10
    },
    resultItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectedItem: {
        backgroundColor: '#ffe0b2'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        gap: 10
    }
});