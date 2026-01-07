import { StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'

const MyButton = ({loading, onPress, btnLabel, ...props}) => {
  return (
    <Button
        loading={loading}
        disabled={loading}
        mode="contained" 
        style={styles.btn} 
        contentStyle={{ height: 50 }}
        onPress={onPress}
        {...props}
    >
        {btnLabel}
    </Button>
  )
}

export default MyButton;

const styles = StyleSheet.create({
    btn: {
      paddingHorizontal: 20,
      backgroundColor: '#ee6a0dff',
      borderRadius: 12,
    }
})