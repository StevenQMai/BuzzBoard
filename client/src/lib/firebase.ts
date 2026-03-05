import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA4siXZv8B3AjyHofK9dWziLCXtyvmSfmU",
  authDomain: "buzzboard-d5b8a.firebaseapp.com",
  projectId: "buzzboard-d5b8a",
  storageBucket: "buzzboard-d5b8a.firebasestorage.app",
  messagingSenderId: "627491840582",
  appId: "1:627491840582:web:1bb0d43931bc458a372047",
  measurementId: "G-948BQ2RNK7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
