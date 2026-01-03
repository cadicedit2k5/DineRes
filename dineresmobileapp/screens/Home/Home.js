import { ScrollView, StyleSheet, Text} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Layout/Header'

const Home = () => {
  return (
    <SafeAreaView>
      <Header />
      <ScrollView>
        <Text>Home</Text>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
 
});