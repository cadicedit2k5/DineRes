import * as ImagePicker from 'expo-image-picker';

export const pickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        alert("Bạn chưa cấp quyền truy cập thư viện ảnh!");
        return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
        const selectedImage = result.assets[0];

        return {
            uri: selectedImage.uri,
            name: selectedImage.fileName || "avatar.jpg",
            type: selectedImage.mimeType || "image/jpeg"
        };
    }
    return null;
};