import { useState, useEffect, useCallback, useContext } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { ref, onChildAdded, push, serverTimestamp, update } from 'firebase/database';
import { db } from '../../utils/firebaseUtils'; 
import { MyUserContext } from '../../utils/contexts/MyContexts';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoBack from '../../components/Layout/GoBack';
import { Text } from 'react-native-paper';
import MyStyles from '../../styles/MyStyles';

const ChefChatDetail = () => {
    const [user, ] = useContext(MyUserContext);
    const route = useRoute();
    const { customerId, customerName } = route.params;

    const [messages, setMessages] = useState([]);
    
    const chatRoomId = `USER_${customerId}`;

    useEffect(() => {
        const messagesRef = ref(db, `support_chats/${chatRoomId}/messages`);
        
        const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
            const messageVal = snapshot.val();
            const newMessage = {
                _id: snapshot.key,
                text: messageVal.text,
                createdAt: new Date(messageVal.createdAt),
                user: messageVal.user,
            };
            setMessages(previousMessages => {
                if (previousMessages.some(msg => msg._id === newMessage._id)) {
                    return previousMessages;
                }
                return GiftedChat.append(previousMessages, newMessage);
            });
        });

        return () => unsubscribe();
    }, [chatRoomId]);

    const onSend = useCallback((messages = []) => {
        const msg = messages[0];
        
        push(ref(db, `support_chats/${chatRoomId}/messages`), {
            text: msg.text,
            createdAt: serverTimestamp(),
            user: {
                _id: user.id,
                name: "Đầu bếp: " + user.last_name,
                avatar: user.avatar
            }
        });

        update(ref(db, `support_chats/${chatRoomId}/info`), {
            lastMessage: "Bạn: " + msg.text,
            timestamp: serverTimestamp(),
        });

    }, [user, chatRoomId]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <GoBack title={`Chat với ${customerName}`} />
            <Text style={MyStyles.subTitle}>{customerName}</Text>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{ _id: user.id }}
                isKeyboardInternallyHandled={false}
            />
        </SafeAreaView>
    );
};

export default ChefChatDetail;