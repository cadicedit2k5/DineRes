import { useContext } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import { Button, IconButton } from 'react-native-paper'
import { MyUserContext, ViewModeContext } from '../../utils/contexts/MyContexts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MyStyles from '../../styles/MyStyles'
import { authApis, endpoints } from '../../utils/Apis'
import { pickImage } from '../../utils/ImageUtils'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

const User = () => {
    const defaultAvatarUrl = 'https://res.cloudinary.com/dxopigima/image/upload/v1767193541/user_u8yhks.png'

    const [user, dispatch] = useContext(MyUserContext);
    const [isCustomerView, setIsCustomerView] = useContext(ViewModeContext);
    const nav = useNavigation();
    const tabBarHeight = useBottomTabBarHeight();

    const logout = async () => {
        await AsyncStorage.removeItem("access-token");
        dispatch({
            "type": "logout",
        })
    }

    const changeAvatar = async () => {
        const avatar = await pickImage();
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

    let icons = [
        {
            icon: "contacts-outline",
            name: "Liên hệ",   
            action: () => console.log("Contact"),
        },
        {
            icon: "information-outline",
            name: "Về chúng tôi",   
            action: () => console.log("About"),
        }
    ]
    if (user) {
        if (isCustomerView) {
            icons.unshift({
                icon: "clipboard-text-clock-outline",
                name: "My Orders",
                action: () => nav.navigate("Orders"),
            }, {
                icon: "clipboard-text-clock-outline",
                name: "Lịch sử đặt bàn",
                action: () => nav.navigate("BookingHistory"),
            })
        }
        if (user.user_role !== 'customer') {
            if (isCustomerView) {
                icons.unshift(
                {
                    icon: "account-switch-outline",
                    name: "Giao diện quản lý",
                    action: () => {setIsCustomerView(false)},
                })
            }else {
                icons.unshift(
                {
                    icon: "account-switch-outline",
                    name: "Giao diện người dùng",
                    action: () => {setIsCustomerView(true)},
                })
            }
        }
        icons.unshift(
            {
                icon: "square-edit-outline",
                name: "Chỉnh sửa hồ sơ",
                action: () => nav.navigate("EditProfile")
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
            })
        icons.push(
            {
                icon: "logout",
                name: "Đăng xuất",
                action: logout,
            }
        )
    }else {
        icons.push(
            {
                icon: "login",
                name: "Đăng nhập",
                action: () => nav.navigate("Login"),
            }
        )
    }
  return (
    <SafeAreaView style={{alignItems: "center", width: "100%", backgroundColor: "white", flex: 1}}>
        <Text style={style.profileTitle}>Hồ sơ người dùng</Text>
        {user &&
            <View style={style.profileAvatar}>
                <Image style={MyStyles.avatar} source={{uri: (user?.avatar) ? user.avatar : defaultAvatarUrl}}/>
                <IconButton style={style.changeAvatarBtn}
                    icon="account-edit"
                    size={30}
                    iconColor='white'
                    onPress={changeAvatar}
                />
            </View>
        }
        {user && 
        <Text style={[style.profileTitle, {marginTop: 30}]}>{`${user.first_name} ${user.last_name}`}</Text>
        }
        <FlatList
            data = {icons}
            contentContainerStyle={{
                paddingBottom: tabBarHeight+20
            }}
            style={{width: "100%", marginTop: 10, paddingHorizontal: 10}}
            renderItem={({item}) =>
                <Button 
                mode='text'
                style={style.profileBtn}
                icon={item.icon} 
                textColor='black'
                contentStyle={{justifyContent: 'flex-start'}}
                labelStyle={{fontSize: 17}}
                onPress={item.action}>{item.name}</Button>}
        />
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
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: "lightgray",
        color: "black",
    }
    
})

export default User