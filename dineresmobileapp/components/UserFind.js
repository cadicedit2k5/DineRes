import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useEffect, useState } from 'react'
import { authApis, endpoints } from '../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Button, Modal, Portal, Searchbar, Text, IconButton } from 'react-native-paper';

const UserFind = ({setCustomer, visible, setVisible}) => {
    const [q, setQ] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currCustomer, setCurrCustomer] = useState(null);

    const loadUser = async () => {
        let url = `${endpoints['users']}`;

        if (q) {
            url = `${url}?q=${q}`;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            if (token) {
                const res = await authApis(token).get(url);
                setSearchResults(res.data.results); 
            }            

        } catch (error) {
            console.info(error.response.data);
            alert("Lỗi tải danh sách người dùng.")
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (visible) {
                loadUser();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [q, visible]);

    return (
    <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text variant="titleLarge" style={{ marginBottom: 15, fontWeight: 'bold' }}>Chọn khách hàng</Text>
            
            <Searchbar
                placeholder="Tìm tên khách hàng..."
                onChangeText={setQ}
                value={q}
                style={styles.searchBar}
            />

            <View style={styles.resultList}>
                {loading ? <ActivityIndicator size="small" style={{marginTop: 20}} /> : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            const isSelected = currCustomer?.id === item.id;
                            return (
                                <TouchableOpacity 
                                    style={[styles.resultItem, isSelected && styles.selectedItem]}
                                    onPress={() => setCurrCustomer(item)}
                                >
                                    <Text style={{fontWeight: isSelected ? 'bold' : 'normal'}}>
                                        {item.name || item.username} {item.unit ? `(${item.unit})` : ''}
                                    </Text>
                                    {isSelected && <IconButton icon="check" size={20} />}
                                </TouchableOpacity>
                            )
                        }}
                    />
                )}
            </View>

            <View style={styles.modalButtons}>
                <Button onPress={() => setVisible(false)} textColor="#666">Hủy</Button>
                <Button mode="contained" onPress={() => {
                    setCustomer(currCustomer);
                    setVisible(false);
                    setQ("");
                }} disabled={!currCustomer}>
                   Chọn
                </Button>
            </View>
        </Modal>
    </Portal>
  )
}

export default UserFind;

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%'
    },
    searchBar: {
        elevation: 0,
        backgroundColor: '#f0f0f0',
        marginBottom: 10
    },
    resultList: {
        height: 300,
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
        backgroundColor: '#e3f2fd'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        gap: 10
    }
})