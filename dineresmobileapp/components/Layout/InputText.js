import { useState } from 'react';
import { TextInput } from 'react-native-paper';

const InputText = ({ 
    label, 
    field, 
    value, 
    setValue,
    secureTextEntry = false, 
    ...props
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <TextInput
        mode="outlined"
        label={label}
        value={value[field]}
        onChangeText={(t) => setValue({...value, [field]: t})}
        secureTextEntry={secureTextEntry && !showPass}
        right={secureTextEntry ? (
            <TextInput.Icon 
                icon={showPass ? "eye" : "eye-off"} 
                onPress={() => setShowPass(!showPass)} 
            />
        ) : null}

        style={{ backgroundColor: '#fff' }}
        activeOutlineColor="#ee6a0dff"
        {...props} 
    />
  )
}

export default InputText;