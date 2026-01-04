import { NavigationContainer } from '@react-navigation/native'
import StackNavigator from './StackNavigator'

const MainNavigators = () => {
  return (
    <NavigationContainer>
        <StackNavigator />
    </NavigationContainer>
  )
}

export default MainNavigators