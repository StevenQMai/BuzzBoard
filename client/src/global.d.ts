import type { FirebaseApp } from "firebase/app";

declare global {
  var firebaseApp: FirebaseApp | undefined;
}

export {};
