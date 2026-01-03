import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Apis, { endpoints } from "../utils/Apis";
import { ActivityIndicator, Button, Divider, Modal, Portal, RadioButton, Searchbar, Text, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Categories from "./Categories";
import MyStyles from "../styles/MyStyles";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Rating from "./Layout/Rating";

const Dishes = () => {
  const [cate, setCate] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();

  const [visible, setVisible] = useState(false);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState("");
  const [filters, setFilters] = useState([]);

  const sortList = [
    {
      "value": "",
      "label": "Mặc định"
    },
    {
      "value": "name",
      "label": "Tên"
    },
    {
      "value": "price",
      "label": "Giá"
    },
    {
      "value": "rating",
      "label": "Đánh giá"
    },
  ]

  const filterList = [
    {
      "label": "Giá thấp nhất",
      "value": "min_price",
    },
    {
      "label": "Giá cao nhất",
      "value": "max_price",
    },
    {
      "label": "Thời gian chuẩn bị tối da",
      "value": "max_prep_time",
    },
  ]

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const tabBarHeight = useBottomTabBarHeight();

  const loadDishes = async () => {
    let url = `${endpoints['dishes']}?page=${page}`;

    if (q) {
      url = `${url}&q=${q}`
    }

    if (cate?.id) {
      url = `${url}&cate_id=${cate.id}`
    }

    if (sortField) {
      url = `${url}&ordering=${sortDir}${sortField}`
    }

    if (filters) {
      for (let key in filters) {
        url = `${url}&${key}=${filters[key]}`
      }
    }

    console.info(url);

    try {
      setLoading(true);
      const res = await Apis.get(url);

      if (!res.data.next) {
        setPage(0);
      }

      if (page === 1) {
        setDishes(res.data.results);
      }else if (page > 1) {
        setDishes([...dishes, ...res.data.results]);
      }
    } catch (error) {
      console.error(error)
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      if (page > 0) {
        loadDishes();
      }
    }, 500)

    return () => clearTimeout(timer);
  }, [q, cate, page]);

  useEffect(() => {
    console.log("field", sortField);
    console.log("sortDir", sortDir);
  }, [sortDir, sortField])

  useEffect(()=> {
    setPage(1);
  }, [q, cate])

  const loadMore = () => {
    if (page > 0 && !loading && dishes.length > 0) {
      setPage(page + 1);
    }
  }

  const handleFilter = () => {
    closeMenu();
    loadDishes();
  }

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
      <Categories setCate={setCate}/>

      <View style={styles.dishContainer}>
        <View style={MyStyles.row}>
          {cate ?
         <Text style={MyStyles.title}>{cate.name}</Text>
         :
         <Text style={MyStyles.title}>Tất cả</Text>}

          <View>
            <Button 
              mode="text" 
              onPress={openMenu} 
              textColor="#ee6a0dff"
              icon="sort"
              contentStyle={{flexDirection: 'row-reverse'}}
            >
                Sắp xếp
            </Button>
            <Portal>
              <Modal visible={visible} onDismiss={closeMenu} contentContainerStyle={styles.menuContainer}>
                {/* Sắp xếp */}
                <Text style={styles.menuHeader}>Sắp xếp theo</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
                  
                  {/* CHỌN TRƯỜNG */}
                  <View style={{ flex: 1}}>
                    <RadioButton.Group onValueChange={value => setSortField(value)} value={sortField}>
                      {sortList.map((item, key) => <View key={key} style={styles.radioRow}><RadioButton value={item.value} /><Text>{item.label}</Text></View>)}
                    </RadioButton.Group>
                  </View>

                  <Divider style={{ width: 1, height: '100%', marginHorizontal: 10 }} />

                  {/* CHỌN CHIỀU*/}
                  <View style={{ flex: 1 }}>
                    <RadioButton.Group onValueChange={value => setSortDir(value)} value={sortDir}>
                      <View style={styles.radioRow}><RadioButton value="" /><Text>Tăng dần</Text></View>
                      <View style={styles.radioRow}><RadioButton value="-" /><Text>Giảm dần</Text></View>
                    </RadioButton.Group>
                  </View>
                </View>

                {/* Lọc */}
                <View>
                  <Text style={styles.menuHeader}>Lọc theo</Text>
                  {filterList.map((item, key) => 
                    <TextInput 
                    key={key}
                    mode="outlined"
                    label={item.label}
                    value={filters[item.value]}
                    onChangeText={(t) => setFilters({...filters, [item.value]: t})}
                    style={{
                      marginBottom: 10,
                    }}
                    keyboardType="numeric"
                    />
                  )}
                </View>


                <Button
                  mode="contained"
                  onPress={handleFilter}
                >
                  OK
                </Button>
            </Modal>
            </Portal>
          </View>
        </View>

        <FlatList 
        data={dishes} 
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 15
        }}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
        renderItem={({item, key}) => 
          <View key={key} style={styles.card}>
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
                <TouchableOpacity onPress={() => nav.navigate("DishDetail", {"dishId": item.id})}>
                  <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
                <Text style={styles.price}>
                  {item.price ? parseInt(item.price).toLocaleString('vi-VN') : 0}đ
                </Text>
              </View>
    
              {/* Mô tả */}
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
    
              {/*Đánh giá*/}
              <View style={styles.footerRow}>
                <Rating 
                  rating={item.rating}
                  review_count={item.review_count}
                />
    
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
  
  menuContainer : {
    backgroundColor: "white",
    margin: "10%",
    padding: 20,
    borderRadius: 5,
  }, menuHeader: {
    fontSize: 20,
    fontWeight: 700,
    color: "black",
  },radioRow: {
    display: "flex",
    flexDirection:"row",
    alignItems: "center"
  },

  dishContainer: {
    backgroundColor: "#fff",
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
  addButton: {
    borderColor: "#ee6a0dff",
    borderWidth: 1.25,
    borderRadius: 5,
  },
})
