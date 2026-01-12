import { useState, useEffect, useCallback, useContext } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { ref, onChildAdded, push, serverTimestamp, update } from 'firebase/database';
import { db } from '../../utils/firebaseUtils'; 
import { MyUserContext } from '../../utils/contexts/MyContexts';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';

const CustomerSupportChat = () => {
    const [user, ] = useContext(MyUserContext);
    const [messages, setMessages] = useState([]);

    const chatRoomId = `USER_${user.id}`;
    console.log(chatRoomId);

    useEffect(() => {
        const messagesRef = ref(db, `support_chats/${chatRoomId}/messages`);
        
        const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
            const messageVal = snapshot.val();

            const safeDate = messageVal.createdAt ? new Date(messageVal.createdAt) : new Date();

            const newMessage = {
                _id: snapshot.key,
                text: messageVal.text,
                createdAt: safeDate,
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
    }, []);

    const onSend = useCallback((messages = []) => {
        const msg = messages[0];
        const safeAvatar = user.avatar || "https://res.cloudinary.com/dxopigima/image/upload/v1767193541/user_u8yhks.png";
        const safeName = (user.last_name || "") + " " + (user.first_name || "Khách hàng");

        push(ref(db, `support_chats/${chatRoomId}/messages`), {
            text: msg.text,
            createdAt: serverTimestamp(),
            user: {
                _id: user.id,
                name: safeName,
                avatar: safeAvatar
            }
        })
        .catch(error => console.error("Lỗi PUSH tin nhắn:", error));

        const infoData = {
            name: safeName,
            avatar: safeAvatar,
            lastMessage: msg.text,
            timestamp: serverTimestamp(),
            userId: user.id 
        };

        update(ref(db, `support_chats/${chatRoomId}/info`), infoData)
            .then(() => console.log("Đã cập nhật Info thành công!"))
            .catch(error => {
                console.error("Lỗi UPDATE Info:", error);
            });

    }, [user, chatRoomId]);

    return (
        <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: user.id }}
        />
    );
};

export default CustomerSupportChat;