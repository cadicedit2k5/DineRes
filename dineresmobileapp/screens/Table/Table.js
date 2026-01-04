import { Text} from 'react-native'
import Header from '../../components/Layout/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import Tables from '../../components/Tables'

const Table = () => {
  return (
    <SafeAreaView>
        <Header/>
        <Tables />
    </SafeAreaView>
  )
}

export default Table