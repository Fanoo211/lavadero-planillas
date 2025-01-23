import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2bzD9PrxszwIDO3MCsJ4fXV8XHyBlsws",
  authDomain: "registro-bandejas-manfrey.firebaseapp.com",
  projectId: "registro-bandejas-manfrey",
  storageBucket: "registro-bandejas-manfrey.appspot.com",
  messagingSenderId: "102293525765",
  appId: "1:102293525765:web:27ad51360c5869b377936c",
  measurementId: "G-F376QBY57C",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signOut };
