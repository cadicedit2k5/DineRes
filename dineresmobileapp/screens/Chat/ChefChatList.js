import { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { Text, Avatar, List, Divider } from 'react-native-paper';
import { ref, onValue } from 'firebase/database';
import { db } from '../../utils/firebaseUtils';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const ChefChatList = () => {
    const nav = useNavigation();
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const chatsRef = ref(db, 'support_chats');

        const unsubscribe = onValue(chatsRef, (snapshot) => {
            if (!snapshot.exists()) {
                setConversations([]);
                return;
            }

            const data = snapshot.val();

            const sortedList = Object.keys(data)
                .map(key => {
                    const item = data[key];

                    if (!item.info) {
                        return {
                            id: key,
                            name: "Lỗi dữ liệu (Thiếu Info)",
                            lastMessage: "Không đọc được",
                            timestamp: Date.now(),
                            avatar: null,
                            userId: key.replace("USER_", "")
                        };
                    }

                    return {
                        id: key,
                        ...item.info
                    };
                })
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            setConversations(sortedList);
        }, (error) => {
            console.error(error);
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <Text style={{fontSize: 20, fontWeight: 'bold', padding: 15}}>Tin nhắn từ khách</Text>
            <FlatList
                data={conversations}
                keyExtractor={item => item.id}
                
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>Chưa có tin nhắn nào</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        onPress={() => nav.navigate('ChefChatDetail', { customerId: item.userId, customerName: item.name })}
                    >
                        <List.Item
                            title={item.name}
                            description={item.lastMessage}
                            descriptionNumberOfLines={1}
                            descriptionStyle={{fontWeight: 'bold', color: '#666'}}
                            left={() => (
                                item.avatar ? 
                                <Avatar.Image size={50} source={{ uri: item.avatar }} /> :
                                <Avatar.Icon size={50} icon="account" />
                            )}
                            right={() => <Text style={{fontSize: 11, color: '#999'}}>{moment(item.timestamp).fromNow()}</Text>}
                        />
                        <Divider />
                    </TouchableOpacity>
                )}
            />
        </>
    );
};

export default ChefChatList;