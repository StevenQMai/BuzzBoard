import { Router, Request, Response } from 'express';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/database';
import { getEvents, createEvent, getEventById } from '../controllers';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
    try {
        await getFirebaseAuth().listUsers(1);
        await getFirebaseFirestore().listCollections();
        res.json({ status: 'ok', firebase: 'connected' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.post('/events', createEvent);

export default router;
