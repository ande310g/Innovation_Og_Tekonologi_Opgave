import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    Button,
    FlatList,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    KeyboardAvoidingView
} from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

const Chat = ({ route, navigation }) => {
    const { matchId, matchName } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Create a standardized chat ID
    const chatId = [auth.currentUser.uid, matchId].sort().join('_');

    useEffect(() => {
        const chatRef = ref(database, `chats/${chatId}`);
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMessages(Object.values(data));
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe(); // Clean up listener on component unmount
    }, [chatId]);

    const sendMessage = () => {
        if (newMessage.trim() === '') return;

        const chatRef = ref(database, `chats/${chatId}`);
        const messageData = {
            sender: auth.currentUser.uid,
            text: newMessage,
            timestamp: Date.now(),
        };

        push(chatRef, messageData);
        setNewMessage('');
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <View style={globalStyles.container}>
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity
                        style={globalStyles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={globalStyles.backButton}>← Tilbage</Text>
                    </TouchableOpacity>
                    <Image
                        source={require('../assets/Logo.jpg')}
                        style={{ width: 110, height: 60 }}
                    />
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                    <Text style={globalStyles.title}>Chat with {matchName}</Text>
                    <FlatList
                        data={messages}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Text
                                style={{
                                    alignSelf:
                                        item.sender === auth.currentUser.uid
                                            ? 'flex-end'
                                            : 'flex-start',
                                    backgroundColor:
                                        item.sender === auth.currentUser.uid
                                            ? '#DCF8C6'
                                            : '#ECECEC',
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
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderRadius: 5,
                                padding: 10,
                                marginRight: 10,
                            }}
                            value={newMessage}
                            onChangeText={setNewMessage}
                        />
                        <Button title="Send" onPress={sendMessage} />
                    </View>
                </View>
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


export default Chat;
