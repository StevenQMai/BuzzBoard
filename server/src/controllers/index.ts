import { Request, Response } from 'express';
import { getFirebaseFirestore } from '../config/database';
import { Event } from '../models';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const db = getFirebaseFirestore();
    const snapshot = await db.collection('events').get();

    let events: Event[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Event, 'id'>),
    }));

    const { type } = req.query;
    if (type && typeof type === 'string') {
      events = events.filter((e) => e.Category === type);
    }

    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const db = getFirebaseFirestore();
    const event: Omit<Event, 'id'> = req.body;
    const ref = await db.collection('events').add(event);
    res.status(201).json({ id: ref.id, ...event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const db = getFirebaseFirestore();
    const doc = await db.collection('events').doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    const data = doc.data() as Omit<Event, 'id'>;
    res.json({ id: doc.id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
