import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button, Modal, Portal } from 'react-native-paper';
import MyStyles from '../../styles/MyStyles';
import InputText from '../../components/Layout/InputText';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../utils/Apis';

const EditIngredient = ({visible, setVisible, ingredient, onSaveSuccess}) => {
    const UNIT_OPTIONS = [
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Gram (g)', value: 'gram' },
        { label: 'Mililit (ml)', value: 'ml' },
        { label: 'Cái/Chiếc', value: 'piece' },
        { label: 'Thìa', value: 'spoon' },
    ];

    const [name, setName] = useState("");
    const [unit, setUnit] = useState("kg");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (ingredient) {
            setName(ingredient.name);
            setUnit(ingredient.unit);
        }else {
            setName("");
            setUnit("kg");
        }
    }, [visible]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");

            let res;
            let data = {
                name: name,
                unit: unit,
            }
            if (token) {
                if (ingredient) {
                    res = await authApis(token).patch(endpoints['ingredient-detail'](ingredient.id),
                    data)
                }else {
                    res = await authApis(token).post(endpoints['ingredients'],
                    data)
                }
                onSaveSuccess(res.data);
                setVisible(false);
            }
        } catch (error) {
            console.log(error.response.data);   
        }finally{
            setLoading(false);
        }
    }

    const handlePress = (item) => {
        setUnit(item.value);
    }

  return (
   <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={MyStyles.subTitle}>Thông tin nguyên liệu</Text>

            <View style={{height: 60}}>
                <InputText 
                label={"Tên nguyên liệu"}
                value={name}
                onChangeText={setName}
            />
            </View>

            <FlatList
                data={UNIT_OPTIONS}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{alignItems: 'center' }}
                ItemSeparatorComponent={
                    <View style={styles.itemSeparator} />
                }
                style={{
                    margin: 10,
                }}
                keyExtractor={(item) => item.value}
                renderItem={({item}) => 
                <TouchableOpacity 
                style={{
                    ...styles.tabItem,
                    borderColor: item.value === unit ? "#ee6a0dff" : "gold",
                    backgroundColor: item.value === unit ? "white": "#fcf4e7ff"
                }} 
                onPress={() => handlePress(item)}>
                    <Text style={{
                    fontWeight: 500,
                    color: item.value === unit ? "#d25801ff" : "#111"
                    }}>{item.label}</Text>
                </TouchableOpacity>}
                >
            </FlatList>
            <View style={styles.modalButtons}>
                <Button onPress={() => setVisible(false)} textColor="#666">Hủy</Button>
                <Button style={{backgroundColor: "#ee6a0dff"}}  mode="contained" onPress={handleSave}
                loading={loading} visible={loading}>
                   OK
                </Button>
            </View>
        </Modal>
    </Portal>
  )
}

export default EditIngredient

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%'
    },
    itemSeparator: {
        paddingHorizontal: 5,
    },
    tabItem: {
        display: "flex",
        flexDirection: "row",
        borderWidth: 1.75,
        borderStyle: "solid",
        borderRadius: 20,
        paddingHorizontal: 12, 
        paddingVertical: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        gap: 10
    }
})