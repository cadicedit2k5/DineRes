import Header from '../../components/Layout/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import Tables from '../../components/Tables'

const Table = () => {
  return (
    <SafeAreaView  style={{ flex: 1}}>
        <Header />
        <Tables />
    </SafeAreaView>
  )
}

export default Table