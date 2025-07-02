// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoEDkp5JLQJE-TENOvAk4ux3_Jc4QgtDM",
  authDomain: "login-karvado-bhaiya.firebaseapp.com",
  projectId: "login-karvado-bhaiya",
  storageBucket: "login-karvado-bhaiya.firebasestorage.app",
  messagingSenderId: "691538791152",
  appId: "1:691538791152:web:34f239c468e828b7f89035"
};


const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const db = getFirestore(app);

export { auth, db };
