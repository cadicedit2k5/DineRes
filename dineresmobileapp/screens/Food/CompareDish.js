import { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Modal, Portal, Card, Avatar } from 'react-native-paper';
import GoBack from '../../components/Layout/GoBack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyStyles from '../../styles/MyStyles';
import Rating from '../../components/Layout/Rating';
import MyButton from '../../components/Layout/MyButton';
import { useContext } from 'react';
import { MyCartContext } from '../../utils/contexts/MyContexts';


const CompareDish = () => {
    const [item1, setItem1] = useState(null);
    const [item2, setItem2] = useState(null);

    const [visible, setVisible] = useState(false);
    const [selectingSlot, setSelectingSlot] = useState(1);
    
    const [cart] = useContext(MyCartContext);

    const openSelection = (slot) => {
        setSelectingSlot(slot);
        setVisible(true);
    };

    const selectItem = (item) => {
        if (selectingSlot === 1) setItem1(item);
        else setItem2(item);
        setVisible(false);
    };

    const RenderColumn = ({ item, slot }) => {
        if (!item) {
            return (
                <View style={styles.emptySlot}>
                    <IconButton 
                        icon="plus-circle-outline" 
                        size={50} 
                        iconColor="#ccc"
                        onPress={() => openSelection(slot)}
                    />
                    <Text style={{ color: '#999' }}>Chọn món để so sánh</Text>
                </View>
            );
        }

        return (
            <View style={styles.columnContainer}>
                <TouchableOpacity 
                    style={styles.closeBtn} 
                    onPress={() => slot === 1 ? setItem1(null) : setItem2(null)}
                >
                    <IconButton icon="close" size={20} iconColor="white" />
                </TouchableOpacity>

                <Image 
                    source={item.image ? { uri: item.image } : require("../../assets/DineResLoGo.png")} 
                    style={styles.image} 
                    resizeMode="cover"
                />

                <View style={styles.sectionName}>
                    <Text style={styles.nameText} numberOfLines={2}>{item.name}</Text>
                </View>

                <View style={[styles.rowSection, { backgroundColor: '#f9f9f9' }]}>
                    <Text style={MyStyles.price}>
                        {parseInt(item.price).toLocaleString()}đ
                    </Text>
                </View>

                <Rating
                    rating={item.rating}
                    review_count={`${item.review_count} đánh giá`}
                />

                <View style={styles.descSection}>
                    <Text style={{fontSize: 12, color: '#666'}}>
                        {item.description || "Chưa có mô tả"}
                    </Text>
                </View>

                <Text variant="titleMedium" style={{ marginTop: 20 }}>Nguyên liệu chính</Text>
                <View style={{flex: 1}}>
                    {item.ingredients.map((ing) => 
                        <View key={ing.id}>
                            <Text style={{ fontSize: 15 }}>{ing.name}</Text>
                            {/* <Text style={{ fontWeight: 'bold', color: '#666' }}>{ing.amount} {ing.unit}</Text> */}
                        </View>
                    )}
                </View>

                 <View style={{marginTop: 10}}>
                    <MyButton
                        btnLabel={"Chọn món"}
                    />
                 </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <GoBack />
                <Text style={styles.headerTitle}>So sánh món ăn</Text>
                <View style={{width: 40}} /> 
            </View>

            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#eee' }}>
                    <RenderColumn item={item1} slot={1} />
                </View>

                <View style={{ flex: 1 }}>
                    <RenderColumn item={item2} slot={2} />
                </View>
            </View>


            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalContent}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>Chọn món thay thế</Text>
                    <ScrollView style={{maxHeight: 400}}>
                        {cart.length === 0 ? (
                            <Text>Giỏ hàng trống hoặc chưa tải danh sách.</Text>
                        ) : (
                            cart.map((d, index) => (
                                <TouchableOpacity key={index} onPress={() => selectItem(d)}>
                                    <Card.Title
                                        title={d.name}
                                        subtitle={`${parseInt(d.price).toLocaleString()}đ`}
                                        left={(props) => <Avatar.Image {...props} size={40} source={d.image ? {uri: d.image} : require("../../assets/DineResLoGo.png")} />}
                                        style={{borderBottomWidth: 1, borderColor: '#eee'}}
                                    />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

export default CompareDish;
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    columnContainer: {
        flex: 1,
        padding: 10,
        alignItems: 'center'
    },
    emptySlot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8'
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 10
    },
    closeBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionName: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    rowSection: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        borderRadius: 4
    },
    descSection: {
        flex: 1,
        width: '100%',
        padding: 5,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10
    }
});