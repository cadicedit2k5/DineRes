import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import Apis, { endpoints } from "../utils/Apis";
import { Card, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Dishes = () => {
  const [dishes, setDishes] = useState([]);
  const [q, setQ] = useState("");
  const nav = useNavigation();

  const loadDishes = async () => {
    let url = `${endpoints['dishes']}?page=1`;

    if (q) {
      url = `${url}&q=${q}`
    }

    const res = await Apis.get(url);
    setDishes(res.data.results);
  };

  useEffect(() => {
    loadDishes();
  }, []);

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
