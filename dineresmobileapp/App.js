import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home/Home";
import { NavigationContainer } from "@react-navigation/native";
import DishDetail from "./screens/Home/DishDetail";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import Login from "./screens/User/Login";
import Food from "./screens/Home/Food";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} options={{title: "Dang nhap"}} />
      <Stack.Screen name="Home" component={TabNavigator} options={{title: "Trang chu"}} />
      <Stack.Screen name="DishDetail" component={DishDetail} options={{title: "Chi tiet"}} />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={Home} options={{ title: 'Trang chủ', tabBarIcon: () => <Icon color="blue" source="home" size={30}/> }} />
      <Tab.Screen name="Food" component={Food} options={{ title: 'Món ăn', tabBarIcon: () => <Icon color="blue" source="food" size={30}/> }} />
      <Tab.Screen name="User" component={Login} options={{ title: 'Người dùng', tabBarIcon: () => <Icon color="blue" source="account" size={30}/> }}/>
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <StackNavigator/>
    </NavigationContainer>
  );
};

export default App;
