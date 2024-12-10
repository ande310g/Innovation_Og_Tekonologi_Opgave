import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Touchable } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '../Component/firebase';
import { globalStyles } from './Styles';

const Swipe = ({ navigation }) => {
    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>To do: Lejers Swipe side</Text>
        </View>
    );
};

export default Swipe;