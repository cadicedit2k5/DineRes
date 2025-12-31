import { useContext } from 'react'
import { Text } from 'react-native'
import { Button } from 'react-native-paper'
import { MyUserContext } from '../../utils/contexts/MyContexts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Layout/Header'

const User = () => {
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
  return (
    <SafeAreaView>
        <Header/>
        <Text>WELCOME {user.username}!</Text>

        <Button mode='contained-tonal' icon="logout" onPress={logout}>Đăng xuất</Button>
    </SafeAreaView>
  )
}

export default User