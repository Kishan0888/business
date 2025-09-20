// firebase-config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrwcjFbFeR2kMP1YXD8D9DfVz8Gm7bXGA",
  authDomain: "channeldashboard-59fec.firebaseapp.com",
  projectId: "channeldashboard-59fec",
  storageBucket: "channeldashboard-59fec.appspot.com",
  messagingSenderId: "434116318294",
  appId: "1:434116318294:web:b542345708fb84e5fb57f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
