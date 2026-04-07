import { Request, Response } from 'express';
import { getFirebaseDB } from '../config/database';
import { Event } from '../models';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const db = getFirebaseDB();
    const snapshot = await db.ref('events').once('value');
    const data = snapshot.val();

    if (!data) {
      res.json([]);
      return;
    }

    const events: Event[] = Object.entries(data).map(([id, value]) => ({
      id,
      ...(value as Omit<Event, 'id'>),
    }));

    const { type } = req.query;
    if (type && typeof type === 'string') {
      res.json(events.filter((e) => e.type === type));
      return;
    }

    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const db = getFirebaseDB();
    const event: Omit<Event, 'id'> = req.body;
    const ref = db.ref('events').push();
    await ref.set(event);
    res.status(201).json({ id: ref.key, ...event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
