import { useContext, useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoBack from '../../components/Layout/GoBack';
import MyStyles from '../../styles/MyStyles';
import InputText from '../../components/Layout/InputText';
import { MyUserContext } from '../../utils/contexts/MyContexts';
import ForceLogin from '../../components/Layout/ForceLogin';

const ApplyChef = () => {
    const [profile, setProfile] = useState({})
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState({});
    const [user, dispatch] = useContext(MyUserContext);
    const nav = useNavigation();

    const infos = [{
      title: "Sở trường (Món chay, Pha chế,...)",
      field: "specialty",
    },{
      title: "Số năm kinh nghiệm",
      field: "experience",
    },{
      title: "Giới thiệu bản thân",
      field: "bio",
      multiline:true
    },]

    const validate = (bio, specialty, experience) => {
      let tempErr = {}
      if (!bio) {
        tempErr.bio = "Vui lòng cung cấp đầy đủ thông tin"
      }
      if (!specialty) {
        tempErr.specialty = "Vui lòng cung cấp đầy đủ thông tin"
      }
      if (!experience) {
        tempErr.experience = "Vui lòng cung cấp đầy đủ thông tin"
      }

      setErr(tempErr)
      return Object.values(tempErr).length === 0;
    }

    const handleSubmit = async () => {
      const {bio, specialty, experience} = profile;
      if (validate(bio, specialty, experience)) {
        try {
          setLoading(true);
          const form = new FormData();
          for (let key in profile) {
            form.append(key, profile[key]);
          }
          const token = await AsyncStorage.getItem("access-token");
          const res = await authApis(token).post(endpoints['apply-chef'], 
            form, {
              headers: {
                "Content-Type": "multipart/form-data",
              }
            });

          if (res.status === 201) {
              Alert.alert(res.data.message);
              nav.goBack();
          }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                Alert.alert(error.response.data.message);
            } else {
                Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
      }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          < GoBack/>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text variant="headlineMedium" style={MyStyles.title}>
                        Đăng Ký Đầu Bếp
                    </Text>

                    <Text style={{ marginBottom: 10, color: '#666' }}>
                        Trở thành đối tác của chúng tôi để chia sẻ những món ăn tuyệt vời của bạn.
                    </Text>

                    {user == null ? 
                      <ForceLogin
                        next_screen={"ApplyChef"}
                      />
                    : <>
                      {infos.map(item =>
                        <View key={item.field}>
                            <InputText 
                              value={profile[item.field]}
                              onChangeText={(t) => setProfile({...profile, [item.field]: t})}
                              label={item.title}
                              multiline={item.multiline}
                              error={err[item.field]}
                              onFocus={() => setErr({})}
                            />
                            <HelperText type='error' visible={err[item.field]}>
                                {err[item.field]}
                            </HelperText>
                          </View>
                          )}

                        <Button 
                            mode="contained" 
                            onPress={handleSubmit} 
                            loading={loading}
                            disabled={loading}
                            style={{ backgroundColor: '#ee6a0dff', paddingVertical: 5 }}
                        >
                            Gửi Hồ Sơ
                        </Button>
                      </>}
                    

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ApplyChef;

const styles = StyleSheet.create({
  
})