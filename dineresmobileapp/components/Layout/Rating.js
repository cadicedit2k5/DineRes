import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-paper'

const Rating = ({rating, review_count, style}) => {
  return (
     <View style={{...styles.ratingContainer, style}}>
        <Icon source="star" color="#FFD700" size={16} />
        <Text style={styles.ratingText}>{rating}</Text>
        <Text style={styles.reviewCount}> ({review_count})</Text>
    </View>
  )
}

export default Rating

const styles = StyleSheet.create({
    ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: '#888',
    marginLeft: 2,
  },
})