import { Alert, StyleSheet, View} from 'react-native'
import { useContext, useEffect, useState } from 'react'
import ForceLogin from './Layout/ForceLogin'
import InputText from './Layout/InputText'
import { Avatar, Divider, IconButton, Text } from 'react-native-paper'
import MyButton from './Layout/MyButton'
import { MyUserContext } from '../utils/contexts/MyContexts'
import Apis, { authApis, endpoints } from '../utils/Apis'

const DishReviews = ({dishId}) => {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [user, ] = useContext(MyUserContext);
    const [page, setPage] = useState(1);

    const loadComments = async () => {
        const url = endpoints['dish-reviews'](dishId);

        if (page) {
            url = `${url}?page=${page}`;
        }

        try {
            setLoading(true);
            if (dishId) {
                const res = await Apis.get(url);

                if (!res.data.next) {
                    setPage(0);
                }

                if (page === 1) {
                    setComments(res.data.results);
                }else if (page > 1) {
                    setComments([...comments, res.data.result]);
                }
                
                setComments(res.data.results);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadComments();
    }, [dishId, page]);

    const handleReview = async () => {
        if (rating === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn số sao để đánh giá!");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");

            if (token) {
                const res = await authApis(token).post(endpoints['dish-reviews'](dishId),
                    {
                        "comment": comment,
                        "rating": rating,
                    }
                )

                if (res.status === 201) {
                    setComments([res.data, ...comments]);
                    Alert.alert("Thông báo", "Dánh giá món ăn thành công!!");
                }
            }
        } catch (error) {
            console.error(error);
        }finally {
            setLoading(false);
        }
    }

    const loadMore = async () => {
        if (page > 0 && !loading && comments.length > 0) {
            setPage(page + 1);
        }
    }
  return (
    <View>
      {/* Review */}
        <Text variant='titleMedium' style={{fontWeight: "bold", marginBottom: 10, marginTop: 20}}>Viết đánh giá</Text>
        {user === null ? 
        <ForceLogin
            next_params={{"dishId": dishId}}
            next_screen={"DishDetail"}
        />
        : <>
        <View style={{display: "flex", gap: 10}}>
            <InputText 
                label={"Nhập gì đó ..."}
                value={comment}
                onChangeText={(t) => setComment(t)}
                multiline={true}
            />
            {/* đánh giá của khách */}
            <View style={[{flexDirection: "row", justifyContent: "space-between", marginHorizontal: 50}]}>
                {[1, 2, 3, 4, 5].map((star, key) => 
                    <IconButton 
                        key={key}
                        icon="star"
                        iconColor={star <= rating ? "gold" : "gray"}
                        onPress={() => setRating(star)}
                    />
                )}
            </View>
        </View>
        <MyButton 
            btnLabel={"Gửi"}
            loading={loading}
            onPress={handleReview}
        />
        </>}

        <Divider style={{ width: "100%", height: 1, marginVertical: 20 }}/>

        <View>
            <Text variant='titleMedium' style={[styles.sectionTitle, {marginBottom: 10}]}>Đánh giá trước đây</Text>
            {comments.map((c, key) => 
                <View key={key} style={{flexDirection: "row",
                    borderBottomWidth: 1,
                    borderColor: "#999",
                    padding: 20,
                    gap: 20
                }}>
                    <Avatar.Image size={80} source={{uri : c.customer.avatar ? c.customer.avatar : 'https://res.cloudinary.com/dxopigima/image/upload/v1767193541/user_u8yhks.png'}}/>
                    <View style={{flex: 1, justifyContent: "center", gap: 10}}>
                        <Text style={{fontWeight: "bold"}}>{c.customer.username}</Text>
                        <Text style={styles.metaText}>{c.comment}</Text>
                    </View>
                </View>
            )}
        </View>
    </View>
  )
}

export default DishReviews

const styles = StyleSheet.create({})