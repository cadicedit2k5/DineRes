import Header from '../../components/Layout/Header'
import Categories from '../../components/Categories'
import Dishes from '../../components/Dishes'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Food = () => {
    const [cateId, setCateId] = useState();
  return (
    <SafeAreaView>
        <Header />
        <Categories setCateId={setCateId}/>
        <Dishes cateId={cateId}/>
    </SafeAreaView>
  )
}

export default Food