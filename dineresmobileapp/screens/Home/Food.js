import Header from '../../components/Layout/Header'
import Categories from '../../components/Categories'
import Dishes from '../../components/Dishes'
import { View } from 'react-native'

const Food = () => {
  return (
    <View>
        <Header />
        <Categories />
        <Dishes />
    </View>
  )
}

export default Food