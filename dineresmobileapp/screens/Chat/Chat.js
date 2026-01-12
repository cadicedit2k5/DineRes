import { useContext } from 'react'
import { MyUserContext, ViewModeContext } from '../../utils/contexts/MyContexts'
import ChefChatList from './ChefChatList';
import CustomerSupportChat from './CustomerSupportChat';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Header from '../../components/Layout/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import ForceLogin from '../../components/Layout/ForceLogin';

const Chat = () => {
    const [isCustomerView, ] = useContext(ViewModeContext);
    const [user, ] = useContext(MyUserContext);
    const tabBarHeight = useBottomTabBarHeight();
  return (
    <SafeAreaView style={{flex: 1}}>
    <Header/>
    {user ?
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingBottom: tabBarHeight + 20}}>
        {isCustomerView ? 
            <CustomerSupportChat/> 
            :
            <ChefChatList/>
        }
        </View>
    : <ForceLogin />}
    </SafeAreaView>
  )
}

export default Chat