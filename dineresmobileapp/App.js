import { useEffect, useReducer, useState } from "react";
import MyUserReducer from "./utils/reducers/MyUserReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "./utils/Apis";
import { MyUserContext, ViewModeContext } from "./utils/contexts/MyContexts";
import {CLIENT_ID, CLIENT_SECRET} from "@env";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { 
  useFonts, 
  Roboto_400Regular, 
  Roboto_700Bold,
  Roboto_500Medium 
} from '@expo-google-fonts/roboto';

import { MD3LightTheme, PaperProvider, configureFonts } from 'react-native-paper';
import MainNavigators from "./navigators/MainNavigators";

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
  const [isCustomerView, setIsCustomerView] = useState(true);

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

      const res = await Apis.post(endpoints['login'], {
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
          <ViewModeContext.Provider value={[isCustomerView, setIsCustomerView]}>
            <MainNavigators />
          </ViewModeContext.Provider>
        </MyUserContext.Provider>
        </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
