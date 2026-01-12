import Header from '../../components/Layout/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import Tables from '../../components/Tables'
import { useContext } from 'react'
import { MyUserContext } from '../../utils/contexts/MyContexts'
import ForceLogin from '../../components/Layout/ForceLogin'

const Table = () => {
  const [user, ] = useContext(MyUserContext);
  return (
    <SafeAreaView  style={{ flex: 1}}>
        <Header />
        {user ? <Tables /> :
        <ForceLogin />}
    </SafeAreaView>
  )
}

export default Table