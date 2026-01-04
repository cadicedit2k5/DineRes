import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Layout/Header'
import { Icon, Surface, Text } from 'react-native-paper'

const Dashboard = () => {
  const dashboards = [
    {
      "icon": "plus",
      "label": "Thêm món ăn"
    },
    {
      "icon": "food-outline",
      "label": "Quản lý món ăn"
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
      <ScrollView contentContainerStyle={{alignItems: "center", marginTop: 30}}>
        <View style={{width: "90%" ,flexDirection: "row", flexWrap: "wrap", alignItems: "center"}}>

          {dashboards.map((item,key) => 
            <TouchableOpacity key={key} activeOpacity={0.925} style={[styles.dashboardContainer]}>
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
    paddingHorizontal: 20,
    paddingVertical: 30,
    margin: 10,
    backgroundColor: "white",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
});