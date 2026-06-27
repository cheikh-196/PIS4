import { User } from './user';

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  reportId: string;
  reportType: 'lost' | 'found';
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  reportType?: 'lost' | 'found';
  lastMessage: Message;
  count: number;
  unread: number;
}
