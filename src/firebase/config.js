import { initializeApp } from "firebase/app";
import {
  getAuth,
  sendEmailVerification as fbSendEmailVerification,
  onAuthStateChanged as fbOnAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAJG2mRNyXclv4t3Rn30TiaNTRCL1__rs",
  authDomain: "simleapp.firebaseapp.com",
  databaseURL: "https://simleapp-default-rtdb.firebaseio.com",
  projectId: "simleapp",
  storageBucket: "simleapp.firebasestorage.app",
  messagingSenderId: "1058525382298",
  appId: "1:1058525382298:web:a34f746d5f495968950123"

};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

// Export all needed functions with consistent naming
export {
  auth,
  db,
  fbSendEmailVerification as sendEmailVerification,
  fbOnAuthStateChanged as onAuthStateChanged,
  realtimeDb,
};
