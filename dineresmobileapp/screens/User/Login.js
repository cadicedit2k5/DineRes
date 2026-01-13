import { useContext, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Apis, { authApis, endpoints } from '../../utils/Apis';
import { HelperText, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {CLIENT_ID, CLIENT_SECRET} from "@env"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { MyUserContext } from '../../utils/contexts/MyContexts';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputText from '../../components/Layout/InputText';
import MyButton from '../../components/Layout/MyButton';
import MyStyles from '../../styles/MyStyles';

const Login = ({route}) => {
  const info = [{
        title: "Tên đăng nhập",
        field: "username",
        icon: "account"
    }, {
        title: "Mật khẩu",
        field: "password",
        icon: "eye",
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState({});
    const nav = useNavigation();
    const [, dispatch] = useContext(MyUserContext);

    const validate = () => {
      let tmpError = {};
      if (!user.username) tmpError.username = "Vui lòng nhập Tên đăng nhập";
      if (!user.password) tmpError.password = "Vui lòng nhập Mặt khẩu";
      setErr(tmpError);
      return Object.keys(tmpError).length === 0;
  }

  const login = async () => {
    if (validate() === true) {
      try {
        setLoading(true);

        const res = await Apis.post(endpoints['login'], {
          ...user,
          "client_id": CLIENT_ID,
          "client_secret": CLIENT_SECRET,
          "grant_type": "password"
        }, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        if (res.status === 200) {
          console.log(res.data);
          await AsyncStorage.setItem("access-token", res.data.access_token);
          await AsyncStorage.setItem("refresh-token", res.data.refresh_token);

          setTimeout(async () => {
            let u = await authApis(res.data.access_token).get(endpoints['current-user']);
            dispatch({
              "type": "login",
              "payload": u.data,
            });
            const next_screen = route.params?.next_screen;
            const next_params = route.params?.next_params;

            if (next_screen) {
              nav.navigate(next_screen, next_params);
            }else {
              nav.navigate("Home");
            }
          }, 500)
        }
      } catch (error) {
        console.log(error.response.data);
          setErr({"general": "Sai tên đăng nhập hoặc mặt khẩu."});
      }finally{
        setLoading(false);
      }
    }
  }
  
  return (
    <SafeAreaView style={MyStyles.container}>
      <ScrollView style={{ padding: 20 }}
        contentContainerStyle={{
          justifyContent: "center",
          flexGrow: 1
        }}
      >
        <Text style={MyStyles.title}>Đăng nhập</Text>
        
        {info.map(i => (
            <InputText
                key={i.field}
                label={i.title}
                value={user[i.field]}
                secureTextEntry={i.secureTextEntry}
                right={<TextInput.Icon icon={i.icon} />}
                onChangeText={(t) => setUser({...user, [i.field]: t})}
                onFocus={() => setErr({})}
                style={{ marginBottom: 10 }}
                error={err[i.field]}
            />
        ))}

        {err.general && 
          <HelperText type="error" visible={err}>
              Sai tên đăng nhập hoặc mật khẩu!
          </HelperText>
        }

        <MyButton 
            btnLabel={"Đăng nhập"}
            loading={loading} 
            disabled={loading} 
            onPress={login} 
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => nav.navigate("Register")}>
                <Text style={MyStyles.price}>Đăng ký</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
  </SafeAreaView>
  )
}

export default Login