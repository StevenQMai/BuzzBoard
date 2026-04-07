export interface Event {
  id: string;
  title: string;
  type: "School Event" | "Club Meeting";
  date: string;
  time: string;
  location: string;
  description?: string;
  imageUrl?: string;
}
