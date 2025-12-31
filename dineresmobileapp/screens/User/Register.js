import { useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { Text } from 'react-native'
import { Button, HelperText, TextInput } from 'react-native-paper'
import Apis, { endpoints } from '../../utils/Apis'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Register = () => {
  const info = [{
        title: "Tên",
        field: "first_name",
        icon: "text"
    }, {
        title: "Họ và tên lót",
        field: "last_name",
        icon: "text"
    },{
        title: "Số điện thoại",
        field: "phone",
        icon: "phone"
    },{
        title: "Email",
        field: "email",
        icon: "email"
    }, {
        title: "Tên đăng nhập",
        field: "username",
        icon: "account"
    }, {
        title: "Mật khẩu",
        field: "password",
        icon: "eye",
        secureTextEntry: true
    }, {
        title: "Xác nhận mật khẩu",
        field: "confirm",
        icon: "eye",
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    const nav = useNavigation();

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                setUser({...user, "avatar": result.assets[0]})
            }
        }
    }

    const validate = () => {
      if (!user.password || user.password !== user.confirm) {
            setErr(true)
            return false;
        }
        //...

        setErr(false);
        return true;
    }

    const register = async () => {
      if (validate() === true) {
        try {
          setLoading(true);
          const form = new FormData();
          for (let key in user){
            if (key !== 'confirm') {
              if (key === 'avatar') {
                form.append(key, {
                  uri: user.avatar.uri,
                  name: user.avatar.fileName || "avatar.jpg",
                  type: user.avatar.mimeType || "image/jpeg"
                });
              }else {
                form.append(key, user[key]);
              }
            }
          }

          console.info(form);
          const res = await Apis.post(endpoints['register'], form, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });

          if (res.status === 201) {
            nav.navigate("Login");
          }else {
            console.error(res.data);
          }
        } catch (error) {
          console.error(error);
          if (error.response) {
            console.log(error.response.data);
            alert("Lỗi từ server: " + JSON.stringify(error.response.data));
          } else {
            alert("Lỗi đăng ký người dùng!");
          }
        }finally{
          setLoading(false);
        }
      }
      
    }

  return (
    <SafeAreaView>
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Đăng ký người dùng</Text>
        
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
            Mật khẩu KHÔNG khớp!
        </HelperText>

        <TouchableOpacity onPress={pickImage} style={{ marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ color: 'blue', marginBottom: 5 }}>Chọn ảnh đại diện...</Text>
            {user.avatar ? (
                <Image source={{ uri: user.avatar.uri }} style={{ width: 100, height: 100, borderRadius: 20 }} />
            ) : (
                <Text style={{ fontStyle: 'italic', color: 'gray' }}>Chưa chọn ảnh</Text>
            )}
        </TouchableOpacity>

        <Button 
            loading={loading} 
            disabled={loading} 
            mode="contained" 
            onPress={register} 
        >
            Đăng ký
        </Button>
        <Text>Đã có tài khoản? <TouchableOpacity onPress={() => nav.navigate("Login")}>
          <Text>Đăng nhập</Text>
          </TouchableOpacity></Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Register