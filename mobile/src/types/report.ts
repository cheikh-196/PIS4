import { User } from './user';

export type Category =
  | 'electronics' | 'documents' | 'keys' | 'large_items' | 'other';

export interface ReportImage {
  url: string;
  publicId: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number];
}

export interface LostReport {
  _id: string;
  user: User;
  title: string;
  description: string;
  category: Category;
  images: ReportImage[];
  city: string;
  location: Location;
  lostDate: string;
  status: 'active' | 'resolved' | 'expired';
  reward: number;
  createdAt: string;
}

export interface FoundReport {
  _id: string;
  user: User;
  title: string;
  description: string;
  category: Category;
  images: ReportImage[];
  city: string;
  location: Location;
  foundDate: string;
  status: 'active' | 'returned' | 'expired';
  heldAt?: string;
  createdAt: string;
}

export interface ReportFormData {
  title: string;
  description: string;
  category: Category;
  city: string;
  coordinates: [number, number];
  date: string;
  reward?: number;
  heldAt?: string;
  images?: any[];
}
