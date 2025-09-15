// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "@firebase/auth";
import {getFirestore} from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDcbLrJJNqjF_gXyMINYo3Ql01_ZubPjM",
  authDomain: "contact-manager-f0015.firebaseapp.com",
  projectId: "contact-manager-f0015",
  storageBucket: "contact-manager-f0015.firebasestorage.app",
  messagingSenderId: "294352749473",
  appId: "1:294352749473:web:257036b9343d53d53941e0",
  measurementId: "G-FP84CCRK04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);


export const auth = getAuth(app)
export const db = getFirestore()
