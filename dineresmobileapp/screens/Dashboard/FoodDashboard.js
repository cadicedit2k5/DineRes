import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from '../../components/Layout/GoBack'
import Dishes from '../../components/Dishes'

const FoodDashboard = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
        <GoBack/>
        <Dishes />
    </SafeAreaView>
  )
}

export default FoodDashboard

const styles = StyleSheet.create({})