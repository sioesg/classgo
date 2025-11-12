import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8eKnz7sFjX4vNkMIujwHl-_vLiWIahDY",
  authDomain: "classgo-92347.firebaseapp.com",
  projectId: "classgo-92347",
  storageBucket: "classgo-92347.firebasestorage.app",
  messagingSenderId: "892882540587",
  appId: "1:892882540587:web:c955f476e123c57aaab26e",
  measurementId: "G-BVJGFV8N18"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };

