import { useState } from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

const InputText = ({ 
    label, 
    value, 
    onChangeText,
    secureTextEntry = false, 
    error,
    ...props
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={{flex: 1}}>
      <TextInput
          mode="outlined"
          label={label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPass}
          right={secureTextEntry ? (
              <TextInput.Icon 
                  icon={showPass ? "eye" : "eye-off"} 
                  onPress={() => setShowPass(!showPass)} 
              />
          ) : null}
          
          style={{ backgroundColor: '#fff' }}
          activeOutlineColor="#ee6a0dff"
          error={error}
          {...props} 
      />
      {error && 
      <HelperText type="error" visible={true}>
          {error}
      </HelperText>}
    </View>
  )
}

export default InputText;