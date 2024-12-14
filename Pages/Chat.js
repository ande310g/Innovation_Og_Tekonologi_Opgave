import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { auth, database } from '../Component/firebase';

const Chat = ({ route }) => {
    const { matchId, matchName } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const chatRef = ref(database, `chats/${auth.currentUser.uid}_${matchId}`);
        onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMessages(Object.values(data));
            }
        });
    }, [matchId]);

    const sendMessage = () => {
        const chatRef = ref(database, `chats/${auth.currentUser.uid}_${matchId}`);
        const messageData = {
            sender: auth.currentUser.uid,
            text: newMessage,
            timestamp: Date.now(),
        };

        push(chatRef, messageData);
        setNewMessage('');
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Text style={styles.title}>Chat with {matchName}</Text>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Text
                        style={{
                            alignSelf: item.sender === auth.currentUser.uid ? 'flex-end' : 'flex-start',
                            backgroundColor: item.sender === auth.currentUser.uid ? '#DCF8C6' : '#ECECEC',
                            padding: 10,
                            borderRadius: 10,
                            marginVertical: 5,
                        }}
                    >
                        {item.text}
                    </Text>
                )}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                    style={{ flex: 1, borderWidth: 1, borderRadius: 5, padding: 10, marginRight: 10 }}
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <Button title="Send" onPress={sendMessage} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default Chat;
