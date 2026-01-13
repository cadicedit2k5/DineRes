import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { ViewModeContext } from "../utils/contexts/MyContexts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Food from "../screens/Food/Food";
import User from "../screens/User/User";
import Dashboard from "../screens/Dashboard/Dashboard";
import TabBarIcon from "../components/Layout/TabBarIcon";
import Table from "../screens/Table/Table";
import Chat from "../screens/Chat/Chat";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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
    {!isCustomerView ? <>
        <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="view-dashboard" label="Dashboard" />}}/>
    </>
    :<>
        <Tab.Screen name="Food" component={Food} options={{ title: 'Món ăn', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="food" label="Đồ ăn" />}} />
        <Tab.Screen name="Table" component={Table} options={{ title: 'Đặt bàn', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="receipt-text-edit" label="Đặt bàn" /> }} />
    </>}
        <Tab.Screen name="Chat" component={Chat} options={{ title: 'Chat', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="chat-processing" label="Chat" /> }} />
        <Tab.Screen name="User" component={User} options={{ title: 'Người dùng', tabBarIcon: ({color="#dcbb87"}) => <TabBarIcon color={color} icon="account" label="Tôi" /> }}/>
    </Tab.Navigator>
  );
}

export default TabNavigator