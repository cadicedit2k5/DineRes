import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { IconButton } from 'react-native-paper'

const QuantityChange = ({quantity, increaseQty, decreaseQty}) => {
  return (
    <View style={styles.qtyContainer}>
        <IconButton icon="minus" size={20} onPress={decreaseQty} mode="contained-tonal" />
        <Text style={styles.qtyText}>{quantity}</Text>
        <IconButton icon="plus" size={20} onPress={increaseQty} mode="contained" containerColor="#ee6a0dff" iconColor="#fff" />
    </View>
  )
}

export default QuantityChange

const styles = StyleSheet.create({
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    qtyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 12,
    },
})