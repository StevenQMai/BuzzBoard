"use client";

import { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA4siXZv8B3AjyHofK9dWziLCXtyvmSfmU",
  authDomain: "buzzboard-d5b8a.firebaseapp.com",
  projectId: "buzzboard-d5b8a",
  storageBucket: "buzzboard-d5b8a.firebasestorage.app",
  messagingSenderId: "627491840582",
  appId: "1:627491840582:web:1bb0d43931bc458a372047",
  measurementId: "G-948BQ2RNK7",
};

export default function FirebaseClient() {
  useEffect(() => {
    if (!globalThis.firebaseApp) {
      const app = initializeApp(firebaseConfig);
      globalThis.firebaseApp = app;
      if (typeof window !== "undefined") {
        try {
          getAnalytics(app);
        } catch (e) {
          // analytics may not be available in some environments
          console.warn("Firebase analytics init failed", e);
        }
      }
    }
  }, []);

  return null;
}
