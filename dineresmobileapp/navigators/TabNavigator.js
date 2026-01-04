import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { MyUserContext, ViewModeContext } from "../utils/contexts/MyContexts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Home from "../screens/Home/Home";
import Food from "../screens/Food/Food";
import Booking from "../screens/Booking/Booking";
import Chat from "../screens/Chat/Chat";
import User from "../screens/User/User";
import Dashboard from "../screens/Dashboard/Dashboard";
import TabBarIcon from "../components/Layout/TabBarIcon";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user,] = useContext(MyUserContext);
  const [isCustomerView, ] = useContext(ViewModeContext);
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
    {!isCustomerView ? <>
        <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="view-dashboard" label="Dashboard" />}}/>
    </>
    :<>
        <Tab.Screen name="Food" component={Food} options={{ title: 'Món ăn', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="food" label="Đồ ăn" />}} />
        <Tab.Screen name="Booking" component={Booking} options={{ title: 'Đặt bàn', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="receipt-text-edit" label="Đặt bàn" /> }} />
    </>}
        <Tab.Screen name="Chat" component={Chat} options={{ title: 'Chat', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="chat-processing" label="Chat" /> }} />
        <Tab.Screen name="User" component={User} options={{ title: 'Người dùng', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="account" label="Tôi" /> }}/>
    </Tab.Navigator>
  );
}

export default TabNavigator