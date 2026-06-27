export const validateEmail = (email: string): string | null => {
  if (!email) return 'L\'email est requis';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Email invalide';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Le mot de passe est requis';
  if (password.length < 8) return 'Minimum 8 caractères';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Le nom est requis';
  if (name.length < 2) return 'Minimum 2 caractères';
  return null;
};

export const validateTitle = (title: string): string | null => {
  if (!title) return 'Le titre est requis';
  if (title.length < 3) return 'Minimum 3 caractères';
  return null;
};

export const validateDescription = (desc: string): string | null => {
  if (!desc) return 'La description est requise';
  if (desc.length < 10) return 'Minimum 10 caractères';
  return null;
};

export const validateCity = (city: string): string | null => {
  if (!city) return 'La ville est requise';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null;
  const mauritanianPhone = /^(\+222|00222)[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}$/;
  if (!mauritanianPhone.test(phone.trim())) return 'Numéro mauritanien requis (+222 XX XX XX XX)';
  return null;
};
