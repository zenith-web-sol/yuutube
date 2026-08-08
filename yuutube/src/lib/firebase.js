// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKRqLr3qE_GCH52Fte8-FwTiTXv-w7ZQM",
  authDomain: "yuutube-c11a6.firebaseapp.com",
  projectId: "yuutube-c11a6",
  storageBucket: "yuutube-c11a6.firebasestorage.app",
  messagingSenderId: "576101273519",
  appId: "1:576101273519:web:1eb3faff1d3278c16d695a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
