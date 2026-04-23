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

function addTwoHours(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h + 2, m, 0, 0);
  if (d.getHours() < h && h >= 22) return '23:59';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const createEvent = async (req: Request, res: Response) => {
  try {
    const db = getFirebaseFirestore();
    const raw = req.body as Partial<Omit<Event, 'id'>>;

    if (!raw.Title || !raw.Date || !raw.Start_time || !raw.Location) {
      res.status(400).json({ error: 'Missing required fields: Title, Date, Start_time, Location' });
      return;
    }

    const event: Omit<Event, 'id'> = {
      ...raw,
      Title: raw.Title,
      Date: raw.Date,
      Start_time: raw.Start_time,
      Location: raw.Location,
      End_time: raw.End_time || addTwoHours(raw.Start_time),
      Category: raw.Category || 'General',
      Organization: raw.Organization || '',
      Approved: raw.Approved ?? false,
      Created_at: raw.Created_at || new Date().toISOString(),
    };

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
