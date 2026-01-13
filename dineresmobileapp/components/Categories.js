import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Apis, { endpoints } from "../utils/Apis";

const Categories = ({setCate, allCate}) => {
  const [cates, setCates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const loadCates = async () => {
    let res = await Apis.get(endpoints["categories"]);
    const allCates = [
      ...allCate,
      ...res.data.results
    ];

    setCates(allCates);
  };

  const handlePress = (item, index) => {
    setCate(item);
    console.info(item);
    setSelectedIndex(index);
  }

  useEffect(() => {
    loadCates();
  }, []);

  return (
    <View>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginLeft: 20,
        color: '#333'
    }}>Danh mục</Text>
      <FlatList
        data={cates}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center' }}
        ItemSeparatorComponent={
          <View style={styles.itemSeparator} />
        }
        style={{
          margin: 10,
        }}
        renderItem={({item, index}) => 
        <TouchableOpacity 
        key={index}
        style={{
          ...styles.tabItem,
          borderColor: selectedIndex === index ? "#ee6a0dff" : "gold",
          backgroundColor: selectedIndex === index ? "white": "#fcf4e7ff"
        }} 
        onPress={() => handlePress(item, index)}>
          {item.image && <Image style={{width: 20, height: 20, marginRight: 7}} source={{uri: item.image}}/>}
          <Text style={{
            fontWeight: 500,
            color: selectedIndex === index ? "#d25801ff" : "#111"
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
    borderWidth: 1.75,
    borderStyle: "solid",
    borderRadius: 20,
    paddingHorizontal: 12, 
    paddingVertical: 8,
  },
})