import { View, Text } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const ForceLogin = ({next_params, next_screen}) => {
    const nav = useNavigation();
  return (
    <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: '#666' }}>
            Vui lòng{' '}
            <Text 
                style={{ fontWeight: 'bold', color: '#ee6a0dff', textDecorationLine: 'underline' }}
                onPress={() => nav.navigate("Login", { 
                    "next_screen": {next_screen},
                    "next_params": {next_params}
                })}
            >
                Đăng nhập
            </Text>
            {' '}để viết đánh giá.
        </Text> 
    </View>
  )
}

export default ForceLogin