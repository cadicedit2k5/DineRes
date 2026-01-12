import Header from '../../components/Layout/Header'
import Dishes from '../../components/Dishes'
import { SafeAreaView } from 'react-native-safe-area-context'

const Food = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#F9F9F9"}}>
        <Header />
        <Dishes mode={"order"}/>
    </SafeAreaView>
  )
}

export default Food