import React from 'react'
import { Text, View } from 'react-native'
import { Icon } from 'react-native-paper'

const TabBarIcon = ({icon="home", label="Home", color}) => {
  return (
    <View style={{alignItems: "center", justifyContent: "center"}}>
        <Icon source={icon} size={30} color={color} />
        <Text style={{fontSize: 10, color: "#888"}}>{label}</Text>
    </View>
  )
}

export default TabBarIcon