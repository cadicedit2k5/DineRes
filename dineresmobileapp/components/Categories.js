import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Apis, { endpoints } from "../utils/Apis";

const Categories = ({setCateId}) => {
  const [cates, setCates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const loadCates = async () => {
    let res = await Apis.get(endpoints["categories"]);
    const allCates = [
      { id: null, name: "Tất cả", image: null},
      ...res.data.results
    ];
    setCates(allCates);
  };

  const handlePress = (id, index) => {
    setCateId(id);
    setSelectedIndex(index);
  }

  useEffect(() => {
    loadCates();
  }, []);

  return (
    <View>
      <FlatList
        data={cates}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center' }}
        ItemSeparatorComponent={
          <View style={styles.itemSeparator} />
        }
        style={{
          margin: 10
        }}
        renderItem={({item, index}) => 
        <TouchableOpacity 
        key={index}
        style={{
          ...styles.tabItem,
          borderColor: selectedIndex === index ? "#ee6a0dff" : "gold"
        }} 
        onPress={() => handlePress(item.id, index)}>
          {item.image && <Image style={{width: 20, height: 20}} source={{uri: item.image}}/>}
          <Text style={{
            color: selectedIndex === index ? "#ee6a0dff" : "black"
          }}>{item.name}</Text>
        </TouchableOpacity>}
      >
      </FlatList>
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  itemSeparator: {
    paddingHorizontal: 5,
  },
  tabItem: {
    display: "flex",
    flexDirection: "row",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 20,
    paddingHorizontal: 12, 
    paddingVertical: 8,
  },
})