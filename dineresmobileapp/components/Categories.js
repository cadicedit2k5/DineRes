import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Apis, { endpoints } from "../utils/Apis";
import { Chip } from "react-native-paper";

const Categories = () => {
  const [cates, setCates] = useState([]);

  const loadCates = async () => {
    let res = await Apis.get(endpoints["categories"]);
    setCates(res.data.results);
  };

  useEffect(() => {
    loadCates();
  }, []);

  return (
    <View>
      {cates.map((cate) => (
          <Chip key={cate.id} icon="label">{cate.name}</Chip>
      ))}
    </View>
  );
};

export default Categories;
