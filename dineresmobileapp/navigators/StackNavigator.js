import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { MyUserContext, ViewModeContext } from "../utils/contexts/MyContexts";
import TabNavigator from "./TabNavigator";
import Login from "../screens/User/Login";
import DishDetail from "../screens/Food/DishDetail";
import EditProfile from "../screens/User/EditProfile";
import Register from "../screens/User/Register";
import ChangePassword from "../screens/User/ChangePassword";
import ApplyChef from "../screens/User/ApplyChef";
import Cart from "../screens/Cart/Cart";
import CompareDish from "../screens/Food/CompareDish";
import MyOrders from "../screens/Cart/MyOrders";
import Payment from "../screens/Cart/Payment";
import Dashboard from "../screens/Dashboard/Dashboard";
import Booking from "../screens/Booking/Booking";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [user, ] = useContext(MyUserContext);
  const [isCustomerView, ] = useContext(ViewModeContext);

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
      <Stack.Screen name="Payment" component={Payment} options={{title: "Thanh toan"}} />
      <Stack.Screen name="Booking" component={Booking} options={{ title: "Đặt bàn" }} />

    {!isCustomerView && <>
      <Stack.Screen name="Dashboard" component={Dashboard} options={{title: "Bang dieu khien"}} />
    </>}

    </Stack.Navigator>
  );
};


export default StackNavigator