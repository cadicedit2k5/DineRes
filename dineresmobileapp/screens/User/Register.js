import { useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { Text } from 'react-native'
import { TextInput } from 'react-native-paper'
import Apis, { endpoints } from '../../utils/Apis'
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { pickImage } from '../../utils/ImageUtils'
import InputText from '../../components/Layout/InputText'
import MyStyles from '../../styles/MyStyles'
import MyButton from '../../components/Layout/MyButton'

const Register = () => {
  const info = [{
        title: "Tên",
        field: "first_name",
        icon: "text",
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
    const nav = useNavigation();
    const [err, setErr] = useState({});

    const chooseAvatar = async () => {
        const avatar = await pickImage();

        if (avatar) {
          setUser({...user, "avatar" : avatar})
        }
    }

    const validate = () => {
      let tmpError = {};
      if (!user.first_name) tmpError.first_name = "Vui lòng nhập Tên";
      if (!user.last_name) tmpError.last_name = "Vui lòng nhập Họ và tên lót";
      if (!user.username) tmpError.username = "Vui lòng nhập Tên đăng nhập";
      if (!user.password) tmpError.password = "Vui lòng nhập Mặt khẩu";
      if (!user.phone) tmpError.phone = "Vui lòng nhập Số điện thoại";
      if (!user.email) tmpError.email = "Vui lòng nhập email";
      if (user.confirm !== user.password) tmpError.confirm = "Mật khẩu không khớp";
      setErr(tmpError);
      return Object.keys(tmpError).length === 0;
    }

    const register = async () => {
      if (validate() === true) {
        try {
          setLoading(true);
          const form = new FormData();
          for (let key in user){
            if (key !== 'confirm') {
                form.append(key, user[key]);
            }
          }

          console.info(form);
          const res = await Apis.post(endpoints['register'], form, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });

          if (res.status === 201) {
            alert("Đăng ký thành công");
            nav.navigate("Login", {"next_screen": "Home"});
          }
        } catch (error) {
          const errorData = error.response.data;
          console.log(errorData);
          let errTmp = {}
          for (let key in errorData) {
            errTmp[key] = errorData[key][0];
          }
          setErr(errTmp);
        }finally{
          setLoading(false);
        }
      }
      
    }

  return (
    <SafeAreaView style={MyStyles.container}>
      <ScrollView style={{ padding: 20 }}
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center"
        }}
      >
        <Text style={MyStyles.title}>Đăng ký người dùng</Text>
        
        {info.map(i => (
            <InputText
                key={i.field}
                label={i.title}
                value={user[i.field]}
                secureTextEntry={i.secureTextEntry}
                right={<TextInput.Icon icon={i.icon} />}
                onChangeText={(t) => setUser({...user, [i.field]: t})}
                style={{ marginBottom: 10 }}
                error={err[i.field]}
            />
        ))}

        {/* <HelperText type="error">
            Mật khẩu KHÔNG khớp!
        </HelperText> */}

        <TouchableOpacity onPress={chooseAvatar} style={{ marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ color: 'blue', marginBottom: 5 }}>Chọn ảnh đại diện...</Text>
            {user.avatar ? (
                <Image source={{ uri: user.avatar.uri }} style={{ width: 100, height: 100, borderRadius: 20 }} />
            ) : (
                <Text style={{ fontStyle: 'italic', color: 'gray' }}>Chưa chọn ảnh</Text>
            )}
        </TouchableOpacity>

        <MyButton 
            btnLabel={"Đăng ký"}
            loading={loading} 
            disabled={loading}
            onPress={register} 
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => nav.navigate("Login")}>
                <Text style={MyStyles.price}>Đăng nhập</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Register