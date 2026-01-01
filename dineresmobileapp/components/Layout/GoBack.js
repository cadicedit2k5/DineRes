import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Button } from 'react-native-paper'

const GoBack = () => {
    const nav = useNavigation();
  return (
    <Button 
        icon="arrow-left"
        mode="text"
        contentStyle={{justifyContent: "flex-start", marginVertical: 5}}
        onPress={() => nav.goBack()}
        textColor='black'
    >
        Quay lại
    </Button>
  )
}

export default GoBack