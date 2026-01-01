import { Text} from 'react-native'
import Header from '../../components/Layout/Header'
import { SafeAreaView } from 'react-native-safe-area-context'

const Booking = () => {
  return (
    <SafeAreaView>
        <Header/>
        <Text>Booking</Text> 
    </SafeAreaView>
  )
}

export default Booking