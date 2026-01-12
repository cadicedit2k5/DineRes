import { ScrollView, StyleSheet, Text} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Layout/Header'
import MyStyles from '../../styles/MyStyles'

const Home = () => {
  return (
    <SafeAreaView style={MyStyles.container}>
      <Header />
      <ScrollView>
        
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
 
});