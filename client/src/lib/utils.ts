const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Event {
  id: string;
  title: string;
  type: 'School Event' | 'Club Meeting';
  date: string;
  time: string;
  location: string;
  description?: string;
  imageUrl?: string;
}

export async function fetchEvents(type?: string): Promise<Event[]> {
  const url = new URL(`${API_BASE_URL}/api/events`);
  if (type) url.searchParams.set('type', type);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}
