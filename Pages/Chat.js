import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    Button,
    FlatList,
    Text,
    TouchableOpacity,
    Image,
    SafeAreaView,
    KeyboardAvoidingView
} from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

const Chat = ({ route, navigation }) => {
    // Modtager parametre fra navigation
    const { matchId, matchName } = route.params;

    // State til beskeder og den nye besked
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Standardiseret chat-ID for at sikre, at begge parter kan tilgå samme chat
    const chatId = [auth.currentUser.uid, matchId].sort().join('_');

    useEffect(() => {
        // Refererer til specifik chat i Firebase Realtime Database
        const chatRef = ref(database, `chats/${chatId}`);

        // Lytter til ændringer i chatdata
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMessages(Object.values(data)); // Opdaterer beskedlisten med nye beskeder
            } else {
                setMessages([]); // Tømmer listen, hvis der ikke er beskeder
            }
        });

        return () => unsubscribe(); // Rydder op ved unmount
    }, [chatId]);

    const sendMessage = () => {
        // Tjekker om beskeden ikke er tom
        if (newMessage.trim() === '') return;

        // Refererer til den specifikke chat i databasen
        const chatRef = ref(database, `chats/${chatId}`);

        // Opretter et beskedobjekt med afsender, tekst og tidsstempel
        const messageData = {
            sender: auth.currentUser.uid,
            text: newMessage,
            timestamp: Date.now(),
        };

        push(chatRef, messageData); // Skubber beskeden til Firebase
        setNewMessage(''); // Nulstiller inputfeltet
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <View style={globalStyles.container}>
                    {/* Tilbage-knap og logo i toppen */}
                    <View style={globalStyles.backAndLogoContainer}>
                        <TouchableOpacity
                            style={globalStyles.backButton}
                            onPress={() => navigation.goBack()} // Går tilbage til forrige skærm
                        >
                            <Text style={globalStyles.backButton}>← Tilbage</Text>
                        </TouchableOpacity>
                        <Image
                            source={require('../assets/Logo.jpg')}
                            style={{ width: 110, height: 60 }}
                        />
                    </View>


                    <View style={{ flex: 1, padding: 10 }}>
                        <Text style={globalStyles.title}>Chat med {matchName}</Text>

                        {/* Viser beskederne */}
                        <FlatList
                            data={messages}
                            keyExtractor={(item, index) => index.toString()} // Unik nøgle for hver besked
                            renderItem={({ item }) => (
                                <Text
                                    style={{
                                        alignSelf:
                                            item.sender === auth.currentUser.uid
                                                ? 'flex-end' // Højre side, hvis beskeden er fra den nuværende bruger
                                                : 'flex-start', // Venstre side for modtagerens beskeder
                                        backgroundColor:
                                            item.sender === auth.currentUser.uid
                                                ? '#DCF8C6' // Grøn baggrund for sender
                                                : '#ECECEC', // Grå baggrund for modtager
                                        padding: 10,
                                        borderRadius: 10,
                                        marginVertical: 5,
                                    }}
                                >
                                    {item.text}
                                </Text>
                            )}
                        />

                        {/* Inputfelt og send-knap */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    padding: 10,
                                    marginRight: 10,
                                }}
                                value={newMessage} // Binder input til state
                                onChangeText={setNewMessage} // Opdaterer state ved input
                            />
                            {/* Sender besked */}
                            <Button title="Send" onPress={sendMessage} />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Chat;
