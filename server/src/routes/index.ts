import { Router, Request, Response } from 'express';
import { getFirebaseAuth, getFirebaseDB } from '../config/database';

const router = Router();

// TEST: verify firebase auth and realtime db are reachable
router.get('/health', async (req: Request, res: Response) => {
    try {
        await getFirebaseAuth().listUsers(1);
        const db = getFirebaseDB();
        await db.ref('.info/connected').once('value');
        res.json({ status: 'ok', firebase: 'connected' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Define your routes here

export default router;
