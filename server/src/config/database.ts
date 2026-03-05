import admin from 'firebase-admin';

export const initializeFirebase = async () => {
    try {
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        };

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : {} as any),
                ...firebaseConfig,
            });
        }

        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        process.exit(1);
    }
};

export const getFirebaseDB = () => admin.database();
export const getFirebaseAuth = () => admin.auth();
