import 'dotenv/config';
import express from 'express';
import routes from './routes';
import { initializeFirebase } from './config/database';
import { corsMiddleware } from './middleware';
// import { Event } from './models'; // uncomment if re-enabling seed

// const SEED_EVENTS: Omit<Event, 'id'>[] = [
//   { type: 'Club Meeting',  title: 'Chess Club',         date: 'March 14', time: '3:30 PM', location: 'Room 204' },
//   { type: 'School Event', title: 'Spring Talent Show',  date: 'March 15', time: '6:00 PM', location: 'Auditorium' },
//   { type: 'Club Meeting',  title: 'Debate Team',         date: 'March 16', time: '4:00 PM', location: 'Room 112' },
//   { type: 'School Event', title: 'Science Fair',         date: 'March 18', time: '9:00 AM', location: 'Gymnasium' },
//   { type: 'Club Meeting',  title: 'Art Club',            date: 'March 19', time: '3:30 PM', location: 'Room 301' },
// ];

// async function seedEventsIfEmpty() {
//   const db = getFirebaseDB();
//   const snapshot = await db.ref('events').once('value');
//   if (snapshot.exists()) return;
//   const updates: Record<string, Omit<Event, 'id'>> = {};
//   for (const event of SEED_EVENTS) {
//     const key = db.ref('events').push().key!;
//     updates[key] = event;
//   }
//   await db.ref('events').set(updates);
//   console.log('Seeded events into Firebase.');
// }

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase and start the server
const startServer = async () => {
    try {
        // Initialize Firebase
        await initializeFirebase();


        // Root route
        app.get('/', (req, res) => {
            res.send('BuzzBoard API is running!');
        });

        // API routes
        app.use('/api', routes);

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
