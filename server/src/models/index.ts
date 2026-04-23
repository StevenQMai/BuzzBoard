export interface Event {
  id: string;
  Title: string;
  Category?: string;
  Date: string;
  Start_time: string;
  End_time?: string;
  Location: string;
  Organization?: string;
  Description?: string;
  Approved?: boolean;
  Created_at?: string;
  Host_display_name?: string;
}
