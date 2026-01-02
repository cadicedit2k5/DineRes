import { useContext } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Button, IconButton } from 'react-native-paper'
import { MyUserContext } from '../../utils/contexts/MyContexts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MyStyles from '../../styles/MyStyles'
import { authApis, endpoints } from '../../utils/Apis'
import { pickImage } from '../../utils/ImageUtils'

const User = () => {
    const defaultAvatarUrl = 'https://res.cloudinary.com/dxopigima/image/upload/v1767193541/user_u8yhks.png'

    const [user, dispatch] = useContext(MyUserContext);
    const nav = useNavigation();

    const logout = async () => {
        await AsyncStorage.removeItem("access-token");
        dispatch({
            "type": "logout",
        })
        setTimeout(() => {
            nav.navigate("Login");
        }, 200)
    }

    const changeAvatar = async () => {
        const avatar = await pickImage();
        console.info(avatar)
        if (avatar) {
            try {
                const form = new FormData();
                form.append("avatar", avatar);
                const token = await AsyncStorage.getItem("access-token");
                
                const res = await authApis(token).patch(
                    endpoints['current-user'],
                    form,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        }
                    }
                )

                if (res.status === 200) {
                    console.info(res.data);
                    dispatch({
                        "type": "login",
                        "payload": res.data
                    });
                    alert("Cập nhật thành công!");
                }
            } catch (error) {
                console.error("Lỗi API:", error);
            }
        }
    }

    const icons = [
        {
            icon: "square-edit-outline",
            name: "Chỉnh sửa hồ sơ",
            action: () => nav.navigate("EditProfile"),
        },
        {
            icon: "key-variant",
            name: "Thay đổi mật khẩu",   
            action: () => nav.navigate("ChangePassword"),
        },
        {
            icon: "chef-hat",
            name: "Ứng tuyển đầu bếp",   
            action: () => nav.navigate("ApplyChef"),
        },
        {
            icon: "contacts-outline",
            name: "Liên hệ",   
            action: () => console.log("Contact"),
        },
        {
            icon: "information-outline",
            name: "Về chúng tôi",   
            action: () => console.log("About"),
        },
        {
            icon: "logout",
            name: "Đăng xuất",
            action: logout,
        },
    ]
  return (
    <SafeAreaView style={[{alignItems: "center"}, {width: "100%"}]}>
        <Text style={style.profileTitle}>Hồ sơ người dùng</Text>
        <View style={style.profileAvatar}>
            <Image style={MyStyles.avatar} source={{uri: (user.avatar) ? user.avatar : defaultAvatarUrl}}/>
            <IconButton style={style.changeAvatarBtn}
                icon="account-edit"
                size={30}
                iconColor='white'
                onPress={changeAvatar}
            />
        </View>
        <Text style={[style.profileTitle, {marginTop: 30}]}>{`${user.first_name} ${user.last_name}`}</Text>

        <View style={{width: "100%", marginTop: 10, paddingHorizontal: 10}}>
            {icons.map((i, index) =>
                <Button 
                key={index}
                mode='text'
                style={style.profileBtn}
                icon={i.icon} 
                textColor='black'
                contentStyle={{justifyContent: 'flex-start'}}
                labelStyle={{fontSize: 17}}
                onPress={i.action}>{i.name}</Button>
            )}
        </View>
    </SafeAreaView>
  )
}

const style = StyleSheet.create({
    profileTitle : {
        fontSize: 20,
        fontWeight: 800,
        marginTop: 10,
    }
    , profileAvatar :{
        marginTop: 30,
        width: 200,
        alignItems: "center",
    },


    changeAvatarBtn: {
        position: "absolute",
        backgroundColor: "gray",
        left: '50%',
        bottom: -20,
        borderColor: "white",
        borderWidth: 2,
    },
    profileBtn : {
        padding: 15,
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: "lightgray",
        color: "black",
    }
    
})

export default User