import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import GoBack from '../../components/Layout/GoBack'
import Dishes from '../../components/Dishes'
import MyButton from '../../components/Layout/MyButton'
import { useNavigation } from '@react-navigation/native'

const FoodDashboard = () => {
  const nav = useNavigation();
  return (
    <SafeAreaView style={{flex: 1}}>
        <GoBack/>
        <Dishes />
        <MyButton
        btnLabel={"Tạo mới món ăn"}
        onPress={()  => nav.navigate("EditDish", {"dish": null})}
        />
    </SafeAreaView>
  )
}

export default FoodDashboard

const styles = StyleSheet.create({})