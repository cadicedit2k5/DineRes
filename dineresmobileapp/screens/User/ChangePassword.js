import {useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from '../../components/Layout/GoBack'
import { ScrollView, Text, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../utils/Apis';
import { useNavigation } from '@react-navigation/native';
import InputText from '../../components/Layout/InputText';
import MyStyles from '../../styles/MyStyles';
import MyButton from '../../components/Layout/MyButton';

const ChangePassword = () => {
    const info = [{
        title: "Mật khẩu cũ",
        field: "old_password",
        icon: "eye",
        secureTextEntry: true
    }, {
        title: "Mật khẩu mới",
        field: "new_password",
        icon: "eye",
        secureTextEntry: true
    }, {
        title: "Xác nhận mật khẩu",
        field: "confirm",
        icon: "eye",
        secureTextEntry: true
    }];

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const [err, setErr] = useState({});
    const nav = useNavigation();

    const validate = () => {
        let tempErrors = {}; 
        
        if (!user.old_password) tempErrors.old_password = "Vui lòng nhập mật khẩu cũ";
        if (!user.new_password) tempErrors.new_password = "Vui lòng nhập mật khẩu mới";
        if (user.new_password !== user.confirm) tempErrors.confirm = "Xác nhận mật khẩu KHÔNG khớp";

        setErr(tempErrors);
        return Object.keys(tempErrors).length === 0;
    }

    const changePassword = async () => {
        if (validate()) {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("access-token");

                if (token) {
                    const form = new FormData();
                    for (let key in user) {
                        form.append(key, user[key]);
                    }
                    console.info(form);

                    const res = await authApis(token).post(endpoints['change-password'],
                        form,
                        {headers: {
                            "Content-Type": "multipart/form-data",
                        }}
                    )
                    if (res.status === 200) {
                        setUser({});
                        alert(res.data.message);
                        nav.goBack();
                    }
                }
            } catch (error) {
                setErr({old_password: error.response.data?.message});
            } finally {
                setLoading(false);
            }
        }
    }

  return (
    <SafeAreaView style={MyStyles.container}>
        <GoBack/>
        <ScrollView style={{ padding: 20 }}
        >
            <Text style={MyStyles.title}>Thay đổi mật khẩu</Text>
            
            {info.map(i => (
                <View key={i.field} >
                    <InputText  
                        label={i.title}
                        value={user[i.field]}
                        secureTextEntry={i.secureTextEntry}
                        right={<TextInput.Icon icon={i.icon} />}
                        style={{marginBottom: 10}}
                        onChangeText={(t) => {
                            setUser({...user, [i.field]: t});
                            if(err[i.field]) setErr({...err, [i.field]: null});
                        }}
                        error={err[i.field]}
                    />
                </View>
            ))}

            <MyButton 
                btnLabel={'Đổi mật khẩu'}
                loading={loading} 
                disabled={loading}
                onPress={changePassword}
            />
        </ScrollView>
    </SafeAreaView>
  )
}

export default ChangePassword