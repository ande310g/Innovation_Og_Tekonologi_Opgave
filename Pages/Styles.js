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
    backAndLogoContainerMyProfile: {
        paddingTop: Platform.OS === 'ios' ? 10 : 10, // Adjust for iOS notch or Android status bar
        height: 67, // Increased to allow space for logo/buttons
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        borderBottomColor: '#0097B2',
        borderBottomWidth: 1,
        zIndex: 1000,
    },
    menuButton: {
        padding: 10,
        marginRight: 10,
    },
    menuText: {
        fontSize: 24,
        fontWeight: 'bold',
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
        color: '#0097B2',
      },
      listDescription: {
        fontSize: 14,
        color: '#555',
      },
      listDetails: {
        fontSize: 12,
        color: '#888',
      },
    pickerContainer: {
        height: 90, // Match input field height
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#EBEBEB',
        justifyContent: 'center',
        zIndex: 10,               // Ensure dropdown appears above other elements
        position: 'relative',     // Align dropdown with the container
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 3,
        overflow: 'scroll',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
      },
      paginationButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#0097B2',
        borderRadius: 5,
      },
      paginationText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      disabledButton: {
        backgroundColor: '#ddd',
      },
      pageIndicator: {
        fontSize: 16,
        fontWeight: 'bold',
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
        borderColor: '#0097B2', 
        borderWidth: 1.5,
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
      profileImage: {
        width: 300,
        height: 300,
        borderRadius: 150,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#49ACD0',
      },
      name: {
          fontSize: 24,
          fontWeight: 'bold',
      },
      about: {
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 20,
      },
      actions: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '80%',
      },
      noButton: {
          padding: 10,
          borderRadius: 8,
          backgroundColor: '#6c9aab',
          borderRadius: 8,
          alignSelf: 'center',
          borderColor: 'black',
          borderWidth: 1.2,
          justifyContent: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 2,
      },
      yesButton: {
          padding: 10,
          backgroundColor: 'green',
          borderRadius: 8,
          padding: 10,
          backgroundColor: 'red',
          borderRadius: 8,
          backgroundColor: '#49ACD0',
          borderRadius: 8,
          alignSelf: 'center',
          borderColor: 'black',
          borderWidth: 1.2,
          justifyContent: 'center',
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: 0.4, 
          shadowRadius: 2
      },
      profileContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderRadius: 10,
          borderColor: '#49ACD0',
          marginBottom: 50,
        },
        logoutText: {
          color: '#49ACD0',
          fontSize: 18,
          textAlign: 'center',
          marginTop: 10,
          fontFamily: 'gabarito',
          fontWeight: '600',
          marginLeft: 15,
        },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
        fontFamily: 'gabarito',
    },
    grid: {
        marginTop: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    imageContainer: {
        margin: 6,
        borderRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 8,
        margin: 5,
        borderColor: '#0097B2',
        borderWidth: 1,
    },
    zoomButton: {
        backgroundColor: '#007bff',
        padding: 8,
        borderRadius: 4,
        marginTop: 5,
    },
    zoomButtonText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    topRightButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#49ACD0', // Adjust as needed
        padding: 10,
        borderRadius: 5,
        zIndex: 10, // Ensures it stays on top
    },
});