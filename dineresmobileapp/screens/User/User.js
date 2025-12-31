import { useContext } from 'react'
import { Image, Text, View } from 'react-native'
import { Button } from 'react-native-paper'
import { MyUserContext } from '../../utils/contexts/MyContexts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

const User = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const nav = useNavigation();

    const logout = async () => {
        await AsyncStorage.removeItem("access-token");
        dispatch({
            "type": "logout",
        })
        nav.navigate("Login");
    }
  return (
    <View>
        <Text>WELCOME {user.username}!</Text>

        <Button mode='contained-tonal' icon="logout" onPress={logout}>Đăng xuất</Button>
    </View>
  )
}

export default User