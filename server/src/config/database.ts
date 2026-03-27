import admin from 'firebase-admin';

export const initializeFirebase = async () => {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(
                    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
                ),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
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
