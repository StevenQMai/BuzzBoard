"use client";

import { useEffect } from "react";
import { getAnalytics } from "firebase/analytics";
import { app } from "@/lib/firebase";

export default function FirebaseClient() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        getAnalytics(app);
      } catch (e) {
        console.warn("Firebase analytics init failed", e);
      }
    }
  }, []);

  return null;
}

