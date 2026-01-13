import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from '../../components/Layout/GoBack'
import Dishes from '../../components/Dishes'

const OrderDashboard = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <GoBack />
      <Dishes mode={"order"} />
    </SafeAreaView>
  )
}

export default OrderDashboard

const styles = StyleSheet.create({})