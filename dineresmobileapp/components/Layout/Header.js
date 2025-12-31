import { View } from "react-native";
import { IconButton } from "react-native-paper";

const Header = () => {
  return (
    <View>
      <IconButton
        icon="align-horizontal-left"
        size={20}
        onPress={() => console.log("Pressed")}
      />
    </View>
  );
};

export default Header;
