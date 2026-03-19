import 'dotenv/config';
import express from 'express';
import routes from './routes';
import { initializeFirebase } from './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
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
