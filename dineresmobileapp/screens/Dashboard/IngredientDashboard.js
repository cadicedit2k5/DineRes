import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, IconButton, Chip, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Apis, { endpoints } from '../../utils/Apis';
import GoBack from '../../components/Layout/GoBack';
import MyStyles from '../../styles/MyStyles';
import MyButton from '../../components/Layout/MyButton';
import EditIngredient from './EditIngredient';

const IngredientDashboard = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [visible, setVisible] = useState(false);
    const [ingredient, setIngredient] = useState(null);

    const loadIngredients = async () => {
        let url = `${endpoints['ingredients']}?page=${page}`;
        setLoading(true);
        console.log(url);
        try {
            const res = await Apis.get(url);

            if (!res.data.next) {
                setPage(0);
            }
            
            if (page === 1) {
                setIngredients(res.data.results);
            }else if (page > 1) {
                setIngredients([...ingredients, ...res.data.results]);
            }
        } catch (error) {
            console.error(error.response.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            if (page > 0) {
                loadIngredients();
            }
        }, 500)
        return () => clearTimeout(timer);
    }, [page]);

    const loadMore = () => {
        if (page > 0 && ingredients.length > 0) {
            setPage(page + 1);
        }
    };

    const openModal = (item) => {
        setVisible(true);
        setIngredient(item);
    }

    const handleSaveSuccess = (newItem) => {
        if (ingredient) {
            setIngredients(current => current.map(item => 
                item.id === newItem.id ? newItem : item
            ));
        } else {
            setIngredients([newItem, ...ingredients]);
        }
    }

    const handleDelete = (id) => {
        Alert.alert(
            "Xác nhận", 
            "Bạn có chắc muốn xóa nguyên liệu này?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", onPress: () => console.log(`Xóa ID ${id}`) }
            ]
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <GoBack />
            <Text style={MyStyles.title}>Kho nguyên liệu</Text>

            <FlatList
                data={ingredients}
                
                keyExtractor={(item, key) => item.id.toString() + key}
                contentContainerStyle={styles.listContainer}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => 
                    loading && <ActivityIndicator size="large"/>
                }
                renderItem={({ item }) => (
                    <Card style={styles.card} mode="elevated">
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.infoContainer}>
                                <Text variant="titleMedium" style={styles.name}>{item.name}</Text>
                                <Chip icon="scale" style={styles.chip} textStyle={{fontSize: 12}}>
                                    {item.unit}
                                </Chip>
                            </View>
                            
                            <View style={styles.actionButtons}>
                                <IconButton 
                                    icon="pencil" 
                                    iconColor="#2196F3"
                                    size={20}
                                    onPress={()=>openModal(item)}
                                />
                                <IconButton 
                                    icon="delete" 
                                    iconColor="#F44336" 
                                    size={20}
                                    onPress={() => handleDelete(item.id)}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                )}
            />
            
            <EditIngredient
                visible={visible}
                setVisible={setVisible}
                ingredient={ingredient}
                onSaveSuccess={handleSaveSuccess}
            />

            <MyButton
            icon={"plus"}
            btnLabel={"Thêm"}
            onPress={() => openModal(null)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContainer: {
        padding: 10,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 10,
        backgroundColor: 'white',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10
    },
    chip: {
        backgroundColor: '#e0f7fa',
        height: 32
    },
    actionButtons: {
        flexDirection: 'row',
    },
});

export default IngredientDashboard;