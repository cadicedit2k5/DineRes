import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Apis, { endpoints } from "../utils/Apis";
import { Chip } from "react-native-paper";

const Categories = ({setCateId}) => {
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
      <TouchableOpacity onPress={() => setCateId(null)}>
        <Chip icon="label">Tất cả</Chip>
      </TouchableOpacity>
      {cates.map((cate) => (
          <TouchableOpacity key={cate.id} onPress={() => setCateId(cate.id)}>
            <Chip icon="label">{cate.name}</Chip>
          </TouchableOpacity>
      ))}
    </View>
  );
};

export default Categories;
