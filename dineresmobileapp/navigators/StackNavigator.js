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
import Payment from "../screens/Cart/Payment";
import Dashboard from "../screens/Dashboard/Dashboard";
import FoodDashboard from "../screens/Dashboard/FoodDashboard";
import EditDish from "../screens/Dashboard/EditDish";
import Booking from "../screens/Booking/Booking";
import IngredientManager from "../components/IngredientManager";
import Orders from "../screens/Cart/Orders";
import OrderDetail from "../screens/Cart/OrderDetail";
import BookingHistory from "../screens/Booking/BookingHistory";
import OrderDashboard from "../screens/Dashboard/OrderDashboard";
import IngredientDashboard from "../screens/Dashboard/IngredientDashboard";
import PaymentHistory from "../screens/Dashboard/PaymentHistory";
import Chat from "../screens/Chat/Chat";
import ChefChatDetail from "../screens/Chat/ChefChatDetail";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [user, ] = useContext(MyUserContext);
  const [isCustomerView, ] = useContext(ViewModeContext);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={TabNavigator} options={{title: "Trang chu"}} />
      <Stack.Screen name="Login" component={Login} options={{title: "Dang nhap"}} />
      <Stack.Screen name="DishDetail" component={DishDetail} options={{title: "Chi tiet"}} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{title: "Chinh sua ho so"}} />
      <Stack.Screen name="Register" component={Register} options={{title: "Dang ky"}} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{title: "Thay doi mat khau"}} />
      <Stack.Screen name="ApplyChef" component={ApplyChef} options={{title: "Ung tuyen dau bep"}} />
      <Stack.Screen name="Cart" component={Cart} options={{title: "Don dat hang"}} />
      <Stack.Screen name="CompareDish" component={CompareDish} options={{title: "So sanh mon an"}} />
      <Stack.Screen name="Orders" component={Orders} options={{title: "Don hang cua toi"}} />
      <Stack.Screen name="BookingHistory" component={BookingHistory} options={{title: "Lịch sự đặt hàng"}} />
      <Stack.Screen name="Payment" component={Payment} options={{title: "Thanh toan"}} />
      <Stack.Screen name="Booking" component={Booking} options={{ title: "Đặt bàn" }} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: "Chi tiet don hang" }} />
      <Stack.Screen name="ChefChatDetail" component={ChefChatDetail} options={{ title: "Chi tiet tin nhan" }} />

    {!isCustomerView && <>
      <Stack.Screen name="Dashboard" component={Dashboard} options={{title: "Bang dieu khien"}} />
      <Stack.Screen name="FoodDashboard" component={FoodDashboard} options={{title: "Quan ly mon an"}} />
      <Stack.Screen name="EditDish" component={EditDish} options={{title: "Quan ly mon an"}} />
      <Stack.Screen name="IngredientManager" component={IngredientManager} options={{title: "Quan ly mon an"}} />
      <Stack.Screen name="OrderDashboard" component={OrderDashboard} options={{title: "Quan ly dat hang"}} />
      <Stack.Screen name="IngredientDashboard" component={IngredientDashboard} options={{title: "Quan ly nguyen lieu"}} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistory} options={{title: "Lich su thanh toan"}} />

    </>}

    </Stack.Navigator>
  );
};


export default StackNavigator