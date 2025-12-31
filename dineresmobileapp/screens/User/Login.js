import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Apis, { endpoints } from '../../utils/Apis';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {CLIENT_ID, CLIENT_SECRET} from "@env"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';

const Login = () => {
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
        const [err, setErr] = useState(false);
        const nav = useNavigation();

    const validate = () => {
      setErr(false);
      return true;
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
          const accessToken = res.data.access_token;

          await AsyncStorage.setItem("access-token", accessToken);

          nav.navigate("Home");
        }else {
          setErr(true);
        }
      } catch (error) {
        console.error(error);
        if (error.response) {
          console.log(error.response.data);
          alert("Lỗi từ server: " + JSON.stringify(error.response.data));
        } else {
          alert("Lỗi đăng nhập người dùng!");
        }
      }finally{
        setLoading(false);
      }
    }
  }
  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Đăng nhập</Text>
      
      {info.map(i => (
          <TextInput
              key={i.field}
              label={i.title}
              value={user[i.field]}
              secureTextEntry={i.secureTextEntry}
              right={<TextInput.Icon icon={i.icon} />}
              onChangeText={(t) => setUser({...user, [i.field]: t})}
              onFocus={() => setErr(false)}
              style={{ marginBottom: 10 }}
          />
      ))}

      <HelperText type="error" visible={err}>
          Sai tên đăng nhập hoặc mật khẩu!
      </HelperText>

      <Button 
          loading={loading} 
          disabled={loading} 
          mode="contained" 
          onPress={login} 
      >
          Đăng nhập
      </Button>
      <Text>Chưa có tài khoản? <TouchableOpacity onPress={() => nav.navigate("Register")}>
                                <Text>Đăng ký</Text>
                              </TouchableOpacity></Text>
  </ScrollView>
  )
}

export default Login