import { Category } from '../types/report';

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'documents', label: 'Documents', icon: '📄' },
  { value: 'electronics', label: 'Électronique', icon: '📱' },
  { value: 'keys', label: 'Clés', icon: '🔑' },
  { value: 'large_items', label: 'Gros objets', icon: '📦' },
  { value: 'other', label: 'Autre', icon: '✨' },
];

export const CATEGORY_LABELS: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
) as Record<Category, string>;
