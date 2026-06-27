export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `Il y a ${minutes} min`;
    }
    return `Il y a ${hours}h`;
  }
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;

  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
