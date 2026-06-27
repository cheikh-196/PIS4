export interface AppNotification {
  _id: string;
  user: string;
  title: string;
  body: string;
  type: 'match_found' | 'new_message' | 'report_resolved' | 'admin_alert';
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
}
