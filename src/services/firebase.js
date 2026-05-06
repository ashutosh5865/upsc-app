import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAokSP-02d3BZsdGxO_v3LiZjTRjaxgNs4",
  authDomain: "upsc-tracker-84806.firebaseapp.com",
  projectId: "upsc-tracker-84806",
  storageBucket: "upsc-tracker-84806.firebasestorage.app",
  messagingSenderId: "142047137325",
  appId: "1:142047137325:web:35424849c8689bca5ff2a4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);