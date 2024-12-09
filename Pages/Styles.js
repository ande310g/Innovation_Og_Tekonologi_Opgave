import {StyleSheet} from 'react-native';
import { Platform, StatusBar } from 'react-native';

const statusBarHeight = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const topRibbonHeight = statusBarHeight + 67; // Combine status bar height and container height


export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: topRibbonHeight, // Add padding to avoid overlap
        backgroundColor: '#ffffff',
    },
    input: {
        height: 45,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#EBEBEB',
        // Add shadow properties for iOS
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 2,
        // Add elevation for Android 
        elevation: 2,
        fontFamily: 'gabarito',

    },
    inputBio: {
        height: 100,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#EBEBEB',
        // Add shadow properties for iOS
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 2,
        // Add elevation for Android 
        elevation: 2,
        fontFamily: 'gabarito',

    },
    button: {
        marginVertical: 10,
        backgroundColor: '#49ACD0',
        borderRadius: 8,
        width: 150,
        height: 60,
        alignSelf: 'center',
        borderColor: 'black',
        borderWidth: 1.2,
        justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 2,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16, 
        fontFamily: 'gabarito',
    },
    backButton:{
      
        color: '#0097B2',
        fontFamily: 'gabarito',
        fontSize: 16,
        fontWeight: '600',
        
    },
    backAndLogoContainer: {
        position: 'absolute',
        top: 0, // Stick to the top
        left: 0,
        right: 0,
        height: 67,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#ffffff', // Ensure it has a background
        borderBottomColor: '#0097B2',
        borderBottomWidth: 1,
        zIndex: 1000, // Ensure it stays above other components
    },
    title: {    
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'left',
        color: '#0097B2',
        fontFamily: 'gabarito',
        marginBottom: 30,
           },
    label: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'left',
        color: '#0097B2',
        fontFamily: 'gabarito',
        marginBottom: 5,
    },
    date: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'left',
        color: '#0097B2',
        fontFamily: 'gabarito',
        justifyContent: 'center',
    },
    switchLabel: {
        fontSize: 16,
        marginBottom: 10,
        color: '#0097B2',
        fontFamily: 'gabarito',
        
    },
    switch: {
        transform: [{ scaleX: 1 }, { scaleY: 1}],
        marginBottom: 15,
    },
    errorText: {
        color: '#e74c3c',
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 14,
    },
    grid: {
        marginTop: 15,
    },
    imageContainer: {
        flex: 1,
        margin: 6,
        borderRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    switchContainer: {
        marginVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    forgotPasswordText: {
        marginTop: 15,
        textAlign: 'center',
        color: '#007bff',
        fontSize: 14,
    },
    listItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
      },
      listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      listDescription: {
        fontSize: 14,
        color: '#555',
      },
      listDetails: {
        fontSize: 12,
        color: '#888',
      },
});