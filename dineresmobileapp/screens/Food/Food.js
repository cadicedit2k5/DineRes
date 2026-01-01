import Header from '../../components/Layout/Header'
import Dishes from '../../components/Dishes'
import { SafeAreaView } from 'react-native-safe-area-context'

const Food = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
        <Header />
        <Dishes/>
    </SafeAreaView>
  )
}

export default Food