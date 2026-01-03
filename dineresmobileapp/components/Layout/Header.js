import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Image, View } from "react-native";
import { IconButton, Modal, Portal } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../utils/contexts/MyContexts";
import { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import 'moment/locale/vi';
import { useNavigation } from "@react-navigation/native";

const Header = () => {
  const [visible, setVisible] = useState(false);
  const [notifys, setNotifys] = useState([]);
  const [user, ] = useContext(MyUserContext);
  const nav = useNavigation();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const loadNotification = async () => {
    const accessToken = await AsyncStorage.getItem("access-token")
    const res = await authApis(accessToken).get(endpoints['user-notify']);
    setNotifys(res.data.results);
  }

  useEffect(() => {
    loadNotification();
  }, [])

  return (
    <View style={[MyStyles.row, {padding: 10}]}>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={style.notiContainer}>
          <Text style={style.notiHeader}>Thông báo</Text>
          {notifys.length !== 0 ? notifys.map(i => <TouchableOpacity style={MyStyles.margin} key={i.id}>
            <Text style={style.notiTitle}>{i.title}</Text>
            <Text style={style.notiContent}>{i.message}</Text>
            <Text>{moment(i.created_date).fromNow()}</Text>
          </ TouchableOpacity>) 
          : <Text>Không có thông báo!!!</Text>
          }
        </Modal>
      </Portal>

      <IconButton
        icon="align-horizontal-left"
        size={20}
        onPress={() => console.log("Pressed")}
      />

      <TouchableOpacity style={MyStyles.row} onPress={()=>nav.navigate("Home")}>
        <Image style={style.logo} source={require("../../assets/DineResLoGo.png")} />
        <Text style={style.logoText}>DineRes</Text>
      </TouchableOpacity>

      <View style={MyStyles.row}>
        <IconButton
        icon="cart"
        size={20}
        onPress={() => nav.navigate("Cart")}
        />
        <IconButton
          icon="bell"
          size={20}
          onPress={showModal}
        />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
    logo: {
      width: 50,
      height: 50,
    },
    logoText: {
      marginLeft: 10,
      fontSize: 30,
      fontWeight: 700,
    }, notiContainer: {
      width: 300,
      position: "absolute",
      right: 10,
      top: 50,
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
    }, notiHeader: {
      textAlign: "center",
      fontSize: 20,
      fontWeight: 600
    }, notiTitle: {
      fontSize: 16,
      fontWeight: 500,
    }, notiContent: {
      fontSize: 12,
      fontWeight: 300,
      color: "dark"
    }
});

export default Header;
