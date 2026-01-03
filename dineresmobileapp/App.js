import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home/Home";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import DishDetail from "./screens/Food/DishDetail";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import Login from "./screens/User/Login";
import Food from "./screens/Food/Food";
import { useContext, useEffect, useReducer } from "react";
import MyUserReducer from "./utils/reducers/MyUserReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "./utils/Apis";
import { MyUserContext } from "./utils/contexts/MyContexts";
import User from "./screens/User/User";
import {CLIENT_ID, CLIENT_SECRET} from "@env";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  useFonts, 
  Roboto_400Regular, 
  Roboto_700Bold,
  Roboto_500Medium 
} from '@expo-google-fonts/roboto';

import { MD3LightTheme, PaperProvider, configureFonts } from 'react-native-paper';
import Booking from "./screens/Booking/Booking";
import EditProfile from "./screens/User/EditProfile";
import Register from "./screens/User/Register";
import ChangePassword from "./screens/User/ChangePassword";
import { Text, View } from "react-native";
import TabBarIcon from "./components/Layout/TabBarIcon";
import ApplyChef from "./screens/User/ApplyChef";
import Chat from "./screens/Chat/Chat";
import Cart from "./screens/Cart/Cart";
import CompareDish from "./screens/Food/CompareDish";
import MyOrders from "./screens/Cart/MyOrders";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [user, ] = useContext(MyUserContext);
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={TabNavigator} options={{title: "Trang chu"}} />
      {!user && <Stack.Screen name="Login" component={Login} options={{title: "Dang nhap"}} />}
      <Stack.Screen name="DishDetail" component={DishDetail} options={{title: "Chi tiet"}} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{title: "Chinh sua ho so"}} />
      <Stack.Screen name="Register" component={Register} options={{title: "Dang ky"}} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{title: "Thay doi mat khau"}} />
      <Stack.Screen name="ApplyChef" component={ApplyChef} options={{title: "Ung tuyen dau bep"}} />
      <Stack.Screen name="Cart" component={Cart} options={{title: "Don dat hang"}} />
      <Stack.Screen name="CompareDish" component={CompareDish} options={{title: "So sanh mon an"}} />
      <Stack.Screen name="MyOrders" component={MyOrders} options={{title: "Don hang cua toi"}} />

    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user,] = useContext(MyUserContext);
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={
      {headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#ffa008ff",
        tabBarInactiveTintColor: "#000",
        tabBarStyle: {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          marginHorizontal: 10,
          height: 80,
          position: "absolute",
          bottom: insets.bottom,
        },
        tabBarIconStyle: {
          height: 80,
          width: "100%"
        }
      }
      }>
      <Tab.Screen name="Home" component={Home} options={{ title: 'Trang chủ', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color}/>}}/>
      <Tab.Screen name="Food" component={Food} options={{ title: 'Món ăn', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="food" label="Đồ ăn" />}} />
      <Tab.Screen name="Booking" component={Booking} options={{ title: 'Đặt bàn', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="receipt-text-edit" label="Đặt bàn" /> }} />
      <Tab.Screen name="Chat" component={Chat} options={{ title: 'Chat', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="chat-processing" label="Chat" /> }} />
      <Tab.Screen name="User" component={User} options={{ title: 'Người dùng', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="account" label="Tôi" /> }}/>
    </Tab.Navigator>
  );
}

// 2. CẤU HÌNH THEME ROBOTO
const fontConfig = {
  fontFamily: 'Roboto_400Regular', // Font mặc định cho toàn app
};

const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({config: fontConfig}),
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  // 3. LOAD CÁC BIẾN THỂ CỦA ROBOTO
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

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
        console.error("Lỗi check login:", error.message);

        if (error.response.status == 401) {
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

  // 4. CHỜ FONT TẢI XONG
  if (!fontsLoaded) {
    return null; 
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <MyUserContext.Provider value={[user, dispatch]}>
          <NavigationContainer >
            <StackNavigator />
          </NavigationContainer>
        </MyUserContext.Provider>
        </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
