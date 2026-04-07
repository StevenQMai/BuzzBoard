import { Router, Request, Response } from 'express';
import { getFirebaseAuth, getFirebaseDB } from '../config/database';
import { getEvents, createEvent } from '../controllers';

const router = Router();

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

router.get('/events', getEvents);
router.post('/events', createEvent);

export default router;
