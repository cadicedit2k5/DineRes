import { useNavigation } from '@react-navigation/native'
import { IconButton } from 'react-native-paper'

const GoBack = () => {
    const nav = useNavigation();
  return (
    <IconButton 
        icon="arrow-left" 
        mode="contained" 
        containerColor="rgba(255,255,255,0.8)" 
        iconColor="#000"
        onPress={() => nav.goBack()} 
    />
  )
}

export default GoBack