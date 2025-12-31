import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import Apis, { endpoints } from "../utils/Apis";
import { Card, Searchbar, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Dishes = ({cateId}) => {
  const [dishes, setDishes] = useState([]);
  const [q, setQ] = useState("");
  const nav = useNavigation();

  const loadDishes = async () => {
    let url = `${endpoints['dishes']}?page=1`;

    if (q) {
      url = `${url}&q=${q}`
    }

    if (cateId) {
      url = `${url}&cate_id=${cateId}`
    }

    console.info(url);

    const res = await Apis.get(url);
    setDishes(res.data.results);
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      loadDishes();
    }, 500)

    return () => clearTimeout(timer);
  }, [q, cateId]);

  return (
    <>
      <Searchbar
        placeholder="Tìm theo tên"
        onChangeText={setQ}
        value={q}
      />
      <FlatList data={dishes} renderItem={({item}) => 
          <Card>
            <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
            <Card.Content>
              <TouchableOpacity onPress={() => nav.navigate("DishDetail", {"dishId": item.id})}>
                <Text variant="titleLarge">{item.name}</Text>
                </TouchableOpacity>
              <Text variant="bodyMedium">{item.description}</Text>
            </Card.Content>
          </Card>
        }>
        
      </FlatList>
    </>
  );
};

export default Dishes;
