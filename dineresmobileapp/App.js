import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home/Home";
import { NavigationContainer } from "@react-navigation/native";
import DishDetail from "./screens/Home/DishDetail";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import Login from "./screens/User/Login";
import Food from "./screens/Home/Food";
import { useContext, useEffect, useReducer } from "react";
import MyUserReducer from "./utils/reducers/MyUserReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "./utils/Apis";
import { MyUserContext } from "./utils/contexts/MyContexts";
import User from "./screens/User/User";
import {CLIENT_ID, CLIENT_SECRET} from "@env";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [user, ] = useContext(MyUserContext);
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user && <Stack.Screen name="Login" component={Login} options={{title: "Dang nhap"}} />}
      <Stack.Screen name="Home" component={TabNavigator} options={{title: "Trang chu"}} />
      <Stack.Screen name="DishDetail" component={DishDetail} options={{title: "Chi tiet"}} />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user,] = useContext(MyUserContext);
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={Home} options={{ title: 'Trang chủ', tabBarIcon: () => <Icon color="blue" source="home" size={30}/> }} />
      <Tab.Screen name="Food" component={Food} options={{ title: 'Món ăn', tabBarIcon: () => <Icon color="blue" source="food" size={30}/> }} />
      {user && <Tab.Screen name="User" component={User} options={{ title: 'Người dùng', tabBarIcon: () => <Icon color="blue" source="account" size={30}/> }}/>}
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  const checkLogin = async () => {
    const accessToken = await AsyncStorage.getItem("access-token");
    if (!accessToken) {
      console.info("Token het han");
      return;
    }

    try {
      let user = await authApis(accessToken).get(endpoints['current-user']);
      if (user.status === 200) {
        dispatch({"type": "login", "payload": user.data});
        console.info("Token oke! Dang nhap thanh cong");
      }
    } catch (error) {
        console.error("Lỗi check login:", ex.message);

        if (error.respone.status == 401) {
          console.error("Token hết hạn, đang thử refresh...");
          await tryRefreshToken();
        }
    }
  }
  const tryRefreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refresh-token");

      if (!refreshToken) {
          console.info("Không có refresh token -> Logout");
          dispatch({ "type": "logout" });
          return;
      }

      const res = await Apis.post(endpoints['refresh-login'], {
        "refresh_token": refreshToken,
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
      }, {headers: {
        "Content-Type": "multipart/form-data",
      }})

      if (res.status === 200) {
        const newAccessToken = res.data.access_token;
        const newRefreshToken = res.data.refresh_token;

        await AsyncStorage.setItem('access-token', newAccessToken);
        await AsyncStorage.setItem('refresh-token', newRefreshToken);

        console.info("Refresh token thành công! Đang lấy lại thông tin user...");
        const userRes = await authApis(newAccessToken).get(endpoints['current-user']);
        dispatch({ "type": "login", "payload": userRes.data });
      }
    }
    catch (error) {
      console.error(error);
      await AsyncStorage.removeItem('access-token');
      await AsyncStorage.removeItem('refresh-token');
      dispatch({ "type": "logout" });
    }
  }

  useEffect(() => {
    checkLogin();
  }, [])

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <NavigationContainer>
        <StackNavigator/>
      </NavigationContainer>
    </MyUserContext.Provider>
  );
};

export default App;
