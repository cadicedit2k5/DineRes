import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Layout/Header'
import { Icon, Surface, Text } from 'react-native-paper'
import MyStyles from '../../styles/MyStyles'
import { useNavigation } from '@react-navigation/native'

const Dashboard = () => {
  const nav = useNavigation();

  const dashboards = [
    {
      "icon": "food-outline",
      "label": "Quản lý món ăn",
      "action": () => {nav.navigate("FoodDashboard")}
    },
    {
      "icon": "shaker-outline",
      "label": "Quản lý nguyên liệu",
      "action": () => {nav.navigate("IngredientDashBoard")}
    },
    {
      "icon": "book-open-blank-variant-outline",
      "label": "Quản lý Booking"
    },
    {
      "icon": "clipboard-text-clock-outline",
      "label": "Quản lý Order"
    },
    {
      "icon": "history",
      "label": "Lịch sử thanh toán"
    },
     {
      "icon": "chart-bell-curve",
      "label": "Thống kê"
    }
  ]

  return (
    <SafeAreaView>
      <Header />
      <Text style={MyStyles.title}>Dashboard</Text>
      <ScrollView contentContainerStyle={{alignItems: "center", marginTop: 30}}>
        <View style={{width: "90%" ,flexDirection: "row", flexWrap: "wrap", alignItems: "center"}}>

          {dashboards.map((item,key) => 
            <TouchableOpacity key={key} activeOpacity={0.925} 
            onPress={item.action}
            style={[styles.dashboardContainer]}>
              <Surface style={styles.surface}  elevation={1}>
                <Icon source={item.icon} size={40}/>
                <Text variant='titleSmall' style={{
                  marginTop: 10,
                  fontWeight: "bold"
                }}>{item.label}</Text>
              </Surface>
            </TouchableOpacity>
          )}
          

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  dashboardContainer :{
    width: "50%"
  },
  surface: {
    paddingHorizontal: 15,
    paddingVertical: 30,
    margin: 10,
    backgroundColor: "white",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
});