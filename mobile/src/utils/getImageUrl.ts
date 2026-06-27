import { API } from '../constants/api';

export const getImageUrl = (url?: string) => {
  if (!url) return null;
  // Si c'est déjà une URL complète (Cloudinary, http, https, file)
  if (url.startsWith('http') || url.startsWith('file://')) {
    return url;
  }
  // Si c'est un chemin relatif (ex: /uploads/...)
  return `${API.BASE_URL.replace('/api', '')}${url}`;
};
