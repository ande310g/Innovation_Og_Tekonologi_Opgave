import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Checkbox from 'expo-checkbox';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import { globalStyles } from './Styles';

const FilterPage = ({ navigation }) => {
    const [minRent, setMinRent] = useState(0);
    const [maxRent, setMaxRent] = useState(10000);
    const [minSize, setMinSize] = useState(0);
    const [maxSize, setMaxSize] = useState(200);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const copenhagenAreas = [
        'City Center',
        'Nørrebro',
        'Østerbro',
        'Vesterbro',
        'Amager',
        'Frederiksberg',
    ];

    useEffect(() => {
        const fetchFilters = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const db = getDatabase();
                const userFiltersRef = ref(db, `users/${user.uid}/filters`);
                try {
                    const snapshot = await get(userFiltersRef);
                    if (snapshot.exists()) {
                        const filters = snapshot.val();
                        setMinRent(filters.rent?.min || 0);
                        setMaxRent(filters.rent?.max || 10000);
                        setMinSize(filters.size?.min || 0);
                        setMaxSize(filters.size?.max || 200);
                        setSelectedAreas(filters.areas || []);
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to fetch saved filters.');
                }
            }
        };

        fetchFilters();
    }, []);

    const toggleArea = (area) => {
        setSelectedAreas((prev) =>
            prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
        );
    };

    const saveFilters = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const db = getDatabase();
            const userFiltersRef = ref(db, `users/${user.uid}/filters`);
            const filters = {
                rent: { min: minRent, max: maxRent },
                size: { min: minSize, max: maxSize },
                areas: selectedAreas,
            };

            try {
                await set(userFiltersRef, filters);
                Alert.alert('Success', 'Filters saved successfully.');
                navigation.goBack();
            } catch (error) {
                Alert.alert('Error', 'Failed to save filters.');
            }
        } else {
            Alert.alert('Error', 'User not logged in.');
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Filter Listings</Text>

            {/* Rent Filter */}
            <Text style={globalStyles.label}>Rent (DKK/month)</Text>
            <Text style={globalStyles.text}>{`DKK ${minRent} - ${maxRent}`}</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20000}
                step={100}
                value={minRent}
                onValueChange={setMinRent}
            />
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20000}
                step={100}
                value={maxRent}
                onValueChange={setMaxRent}
            />

            {/* Size Filter */}
            <Text style={globalStyles.label}>Size (m²)</Text>
            <Text style={globalStyles.text}>{`${minSize}m² - ${maxSize}m²`}</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={300}
                step={1}
                value={minSize}
                onValueChange={setMinSize}
            />
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={300}
                step={1}
                value={maxSize}
                onValueChange={setMaxSize}
            />

            {/* Area Filter */}
            <Text style={globalStyles.label}>Areas of Copenhagen</Text>
            <FlatList
                data={copenhagenAreas}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            value={selectedAreas.includes(item)}
                            onValueChange={() => toggleArea(item)}
                            style={{ marginRight: 10 }} // Optional: Add custom styling
                        />
                        <Text style={globalStyles.text}>{item}</Text>
                    </View>
                )}
            />

            <TouchableOpacity style={globalStyles.button} onPress={saveFilters}>
                <Text style={globalStyles.buttonText}>Save Filters</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    slider: {
        width: '100%',
        height: 40,
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
});

export default FilterPage;
