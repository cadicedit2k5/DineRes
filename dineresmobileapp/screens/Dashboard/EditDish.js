import { useState, } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApis, endpoints } from '../../utils/Apis';
import GoBack from '../../components/Layout/GoBack';
import { pickImage } from '../../utils/ImageUtils';
import InputText from '../../components/Layout/InputText';
import { SafeAreaView } from 'react-native-safe-area-context';
import IngredientManager from '../../components/IngredientManager';
import Categories from '../../components/Categories';

const EditDish = () => {
    const route = useRoute();
    const nav = useNavigation();
    const { dish } = route?.params;

    const [name, setName] = useState(dish?.name || "");
    const [price, setPrice] = useState(dish?.price?.toString() || "");
    const [prepTime, setPrepTime] = useState(dish?.prep_time?.toString() || "");
    const [description, setDescription] = useState(dish?.description || "");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ingredients, setIngredients] = useState(dish?.ingredients || []);
    const [cate, setCate] = useState({"id": 1});


    const updateDish = async () => {
        if (!name || !price) {
            Alert.alert("Lỗi", "Tên món và giá không được để trống");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            
            let form = new FormData();
            form.append('name', name);
            form.append('price', price);
            form.append('prep_time', prepTime);
            form.append('description', description);
            form.append('category', parseInt(cate.id));
            
            if (image) {
                form.append('image', {
                    uri: image.uri,
                    name: image.fileName || 'dish_image.jpg',
                    type: image.mineType || 'image/jpeg'
                });
            }

            const ingredientsData = ingredients.map(ing => ({
                id: ing.id,
                amount: parseFloat(ing.amount)
            }));
            
            form.append('ingredients', JSON.stringify(ingredientsData));

            console.info(form);
            let res;

            if (dish !== null) {
                res = await authApis(token).patch(endpoints['dish-detail'](dish.id), form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                Alert.alert("Thành công", "Cập nhật món ăn thành công!", [
                    { text: "OK", onPress: () => nav.navigate("DishDetail", { dishId: dish.id }) }
                ]);
            }else {
                res = await authApis(token).post(endpoints["dishes"],
                    form,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        }
                    }
                )
                Alert.alert("Thành công", "Tạo mới món ăn thành công!", [
                    { text: "OK", onPress: () => nav.goBack() }
                ]);
            }
        } catch (error) {
            console.error(error.response.data);
            if (error.response.data.name) {
                Alert.alert("Lỗi", error.response.data.name[0]);
            } else {
                Alert.alert("Lỗi", "Không thể thực hiện hành động.");
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteDish = async () => {
        Alert.alert(
            "Cảnh báo",
            "Bạn có chắc chắn muốn xóa món này không? Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const token = await AsyncStorage.getItem("access-token");
                            await authApis(token).delete(endpoints['dish-detail'](dish.id));
                            
                            Alert.alert("Đã xóa", "Món ăn đã được xóa khỏi thực đơn.", [
                                { text: "Về trang chủ", onPress: () => nav.navigate("Home") }
                            ]);
                        } catch (error) {
                            console.error(error);
                            Alert.alert("Lỗi", "Không thể xóa món ăn lúc này.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container]}>
            <GoBack title="Chỉnh sửa món ăn" />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{flex: 1}}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={async () => {
                            const img = await pickImage();
                            if (img) setImage(img);
                        }}>
                            <Image 
                                source={{ uri: image ? image.uri : dish?.image}} 
                                style={styles.dishImage}
                            />
                            <View style={styles.cameraIcon}>
                                <Text style={{color: 'white', fontWeight: 'bold'}}>Đổi ảnh</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Categories setCate={setCate} allCate={[]}/>

                    {/* KHU VỰC FORM */}
                    <View style={styles.formContainer}>
                        <InputText
                            label={"Tên món ăn"}
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />

                        <View style={styles.row}>
                            <InputText
                                label="Giá (VNĐ)"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                            />
                            <InputText
                                label="Thời gian (phút)"
                                value={prepTime}
                                onChangeText={setPrepTime}
                                keyboardType="numeric"
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>

                        <InputText
                            label="Mô tả"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            style={styles.input}
                            placeholder="Nhập mô tả..."
                        />

                        {/* NGUYÊN LIỆU */}
                        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                            <IngredientManager 
                                ingredients={ingredients} 
                                setIngredients={setIngredients} 
                            />
                        </View>

                        <View style={{ height: 20 }} />

                        {/* NÚT ACTION */}
                        <Button 
                            mode="contained" 
                            onPress={updateDish} 
                            loading={loading}
                            disabled={loading}
                            style={styles.saveButton}
                        >
                            Lưu thay đổi
                        </Button>

                        {dish && <Button 
                            mode="outlined" 
                            onPress={deleteDish} 
                            disabled={loading}
                            textColor="red"
                            style={styles.deleteButton}
                        >
                            Xóa món ăn
                        </Button>}

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditDish;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingBottom: 40,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    dishImage: {
        width: 200,
        height: 200,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ingredientsBox: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    saveButton: {
        backgroundColor: '#ee6a0dff',
        paddingVertical: 5,
        marginBottom: 15,
    },
    deleteButton: {
        borderColor: 'red',
        paddingVertical: 5,
    }
});