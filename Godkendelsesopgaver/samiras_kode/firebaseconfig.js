// Firebsae Config File to connect to Firebase
import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDN7EIvECatgVGEmQkk9wVOMDtb02XxcdY",
  authDomain: "firstproject-7e845.firebaseapp.com",
  databaseURL: "https://firstproject-7e845-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "firstproject-7e845",
  storageBucket: "firstproject-7e845.appspot.com",
  messagingSenderId: "343163387307",
  appId: "1:343163387307:web:ec131f33b9b225f060e6ee",
  measurementId: "G-3799XVZRZ4"
};

if (getApps().length < 1) {
  initializeApp(firebaseConfig);
  console.log("Firebase Initialized!");
}

