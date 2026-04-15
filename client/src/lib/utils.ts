const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Event {
  id: string;
  Title: string;
  Category: string;
  Date: string;
  Start_time: string;
  End_time: string;
  Location: string;
  Organization?: string;
  Description?: string;
  Approved?: boolean;
  Created_at?: string;
  Host_display_name?: string;
  Image_url?: string;
}

export async function fetchEvents(type?: string): Promise<Event[]> {
  const url = new URL(`${API_BASE_URL}/api/events`);
  if (type) url.searchParams.set('type', type);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventById(id: string): Promise<Event> {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    cache: 'no-store',
  });
  if (res.status === 404) throw new Error('Not found');
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}
