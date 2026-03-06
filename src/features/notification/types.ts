export interface Notification {
  id: number;
  is_read: boolean;
  created_at: string;
  article: {
    id: number;
    title: string;
    url: string;
    source: {
      id: string;
      name: string;
    } | null;
  };
}
