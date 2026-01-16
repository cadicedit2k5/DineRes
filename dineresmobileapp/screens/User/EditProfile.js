import { useContext, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context'
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../utils/contexts/MyContexts';
import { useNavigation } from '@react-navigation/native';
import GoBack from '../../components/Layout/GoBack';
import InputText from '../../components/Layout/InputText';
import MyButton from '../../components/Layout/MyButton';
import MyStyles from '../../styles/MyStyles';

const EditProfile = () => {
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
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const [currUser, dispatch] = useContext(MyUserContext);

    useEffect(() => {
        if (currUser) {
            setUser({
                "first_name": currUser.first_name,
                "last_name": currUser.last_name,
                "phone": currUser.phone,
                "email": currUser.email,
                "address": currUser.address,
            });
        }
    }, [currUser])

    const validate = () => {
        return true;
    }

    const editProfile = async() => {
        if (validate()) {
            const form = new FormData();
            for (let key in user) {
                form.append(key, user[key]);
            }

            try {
                setLoading(true)
                const token = await AsyncStorage.getItem("access-token");

                const res = await authApis(token).patch(endpoints['current-user'], form, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                });

                if (res.status === 200) {
                    console.info(res.data);
                    dispatch({
                        "type": "login",
                        "payload": res.data
                    });
                    nav.goBack();
                }
            } catch (error) {
                console.info(error.response.data);
            }finally {
                setLoading(false);
            }
        }
    }

  return (
    <SafeAreaView style={MyStyles.container}>
        <GoBack />
        <ScrollView style={{ padding: 20 }}>
            <Text variant="headlineMedium" style={MyStyles.title}>Chỉnh sửa hồ sơ</Text>
            
            {info.map(i => (
                <InputText
                    key={i.field}   
                    label={i.title}
                    value={user[i.field]}
                    secureTextEntry={i.secureTextEntry}
                    right={<TextInput.Icon icon={i.icon} />}
                    onChangeText={(t) => setUser({...user, [i.field]: t})}
                    style={{ marginBottom: 10 }}
                />
            ))}

            <MyButton 
                btnLabel={"Cập nhật hồ sơ"}
                loading={loading}
                onPress={editProfile} 
            />
        </ScrollView>
    </SafeAreaView>
  )
}

export default EditProfile