import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Layout/Header'
import MyStyles from '../../styles/MyStyles'
import TabBarIcon from '../../components/Layout/TabBarIcon'

const Home = () => {
  return (
    <SafeAreaView style={MyStyles.bg}>
      <Header />
      <ScrollView style={[MyStyles.container, MyStyles.margin]}>
        <Text>Home</Text>
        <TabBarIcon />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home