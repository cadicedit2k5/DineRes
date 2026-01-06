import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import QuantityChange from './Layout/QuantityChange'
import { Button } from 'react-native-paper'
import { Alert } from 'react-native';

const ListOrderDetail = ({details, setDetails}) => {
    const increaseQuantity = (itemId) => {
        const newDetails = details.map(item => {
            if (item.dish_id === itemId) {
                return { ...item, quantity: item.quantity + 1 };
            }
            return item;
        });
        setDetails(newDetails);
    };

    const decreaseQuantity = (itemId) => {
        const newDetails = details.map(item => {
            if (item.dish_id === itemId) {
                if (item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
            }
            return item;
        });  
        setDetails(newDetails);
    };

    const removeItem = (itemId) => {
        Alert.alert(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa món ăn này khỏi giỏ hàng không?",
        [
            {
                text: "Hủy",
                onPress: () => console.log("Hủy xóa"),
            },

            {
                text: "Xóa",
                onPress: () => {
                    const newDetails = details.filter(item => item.dish_id !== itemId);
                    setDetails(newDetails);
                },
            }
        ]
    );
    };

  return (
    <FlatList
        data={details}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
            <View style={styles.cartItem}>
                <Image 
                    source={{ uri: item.image }}
                    style={styles.cartItemImage}
                    resizeMode="cover"
                />

                <View style={{ flex: 1 }}>
                    
                    <View style={styles.cartItemHeader}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 5 }} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <Text style={{ fontWeight: 'bold', color: '#ee6a0dff' }}>
                            {parseInt(item.price_at_order).toLocaleString()}đ
                        </Text>
                    </View>
                    
                    <View style={styles.cartItemFooter}>
                        <QuantityChange 
                            quantity={item.quantity}
                            increaseQty={() => increaseQuantity(item.dish_id)}
                            decreaseQty={() => decreaseQuantity(item.dish_id)}
                        />
                        
                        <View>
                            <Button 
                                mode='contained-tonal' 
                                onPress={() => removeItem(item.dish_id)}
                                labelStyle={{ fontSize: 12 }}
                                compact
                            >
                                Xóa
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        )}
    />

  )
}

export default ListOrderDetail

const styles = StyleSheet.create({
    cartContainer: {
        flex: 1,
        backgroundColor: "#fff"
    },cartItem : { 
        marginBottom: 20, 
        padding: 10, 
        borderBottomWidth: 1, 
        borderColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center'
    },cartItemImage:{
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: '#eee'
    }, cartItemHeader: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        marginBottom: 5
    },
    cartItemFooter: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: "space-between",
        marginTop: 5
    },
})