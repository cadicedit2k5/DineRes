import {Text } from 'react-native'
import Header from '../../components/Layout/Header'
import { SafeAreaView } from 'react-native-safe-area-context'

const Chat = () => {
  return (
    <SafeAreaView>
        <Header/>
      <Text>Chat</Text>
    </SafeAreaView>
  )
}

export default Chat