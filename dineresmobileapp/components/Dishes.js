import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Apis, { endpoints } from "../utils/Apis";
import { ActivityIndicator, Button, Icon, Searchbar, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Categories from "./Categories";
import MyStyles from "../styles/MyStyles";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const Dishes = () => {
  const [cate, setCate] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();

  const tabBarHeight = useBottomTabBarHeight();

  const loadDishes = async () => {
    let url = `${endpoints['dishes']}?page=1`;

    if (q) {
      url = `${url}&q=${q}`
    }

    if (cate?.id) {
      url = `${url}&cate_id=${cate.id}`
    }

    console.info(url);

    try {
      setLoading(true);
      const res = await Apis.get(url);
    setDishes(res.data.results);
    } catch (error) {
      console.error(error)
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      loadDishes();
    }, 500)

    return () => clearTimeout(timer);
  }, [q, cate]);

  return (
    <View style={{flex: 1}}>
      <Searchbar
        placeholder="Tìm theo tên"
        placeholderTextColor="#999"
        onChangeText={setQ}
        value={q}
        style={styles.searchBar}
        inputStyle={styles.inputSearchBar}
      />

      <View style={styles.dishContainer}>
        {cate ? <Text style={MyStyles.title}>{cate.name}</Text>:<Text style={MyStyles.title}>Tất cả</Text>}

        <Categories setCate={setCate}/>

        <FlatList 
        data={dishes} 
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 15
        }}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
        renderItem={({item}) => 
          <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image
                  style={styles.image} 
                  source={require("../assets/DineResLoGo.png")} 
                  resizeMode="cover"
                />
            </View>
    
            <View style={styles.contentContainer}>
              
              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>
                  {item.price ? item.price.toLocaleString('vi-VN') : 0}đ
                </Text>
              </View>
    
              {/* Mô tả */}
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
    
              {/*Đánh giá*/}
              <View style={styles.footerRow}>
                <View style={styles.ratingContainer}>
                  <Icon source="star" color="#FFD700" size={16} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewCount}>(120+)</Text>
                </View>
    
                <Button
                  icon="plus"
                  contentStyle={{ height: 30}}
                  labelStyle={{ fontSize: 12, color: "#ee6a0dff", marginVertical: 0 }}
                  style={styles.addButton}
                  onPress={() => nav.navigate("DishDetail", {"dishId": item.id})}
                >
                  Thêm
                </Button>
              </View>
    
            </View>
          </View>
          }>
        </FlatList>
      </View>
    </View>
  );
};

export default Dishes;

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 10,
    borderWidth: 1, 
    borderColor: '#999',
    height: 50
  },inputSearchBar: {
    fontSize: 16, 
    color: '#333', 
    alignSelf: 'center',
  },
  dishContainer: {
    backgroundColor: "#fff",
    marginTop: 10,
    borderTopColor: "#999",
    borderTopWidth: 0.25,
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
  },

  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F4A460',
  },

  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: '#888',
    marginLeft: 2,
  },
  addButton: {
    borderColor: "#ee6a0dff",
    borderWidth: 1.25,
    borderRadius: 5,
  },
})
