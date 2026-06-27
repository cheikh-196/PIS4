# FindIt - Smart Lost & Found Platform

Application mobile de signalement d'objets perdus et trouvés avec matching intelligent.

## Stack

- **Mobile** : React Native (Expo SDK 54), TypeScript, React Query, Zustand
- **Backend** : Node.js, Express, MongoDB (Mongoose)
- **Auth** : JWT, bcrypt
- **Stockage images** : Cloudinary (fallback local)
- **Notifications** : Expo Push Notifications
- **API** : Swagger ( `/api-docs`)

## Structure

```
pis4/
├── mobile/          # Application React Native Expo
│   ├── app/         # Screens (Expo Router)
│   └── src/         # Composants, hooks, services, types
├── server/          # API Express
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/    # matchingService, notificationService
│       ├── middleware/
│       └── validators/
└── README.md
```

## Installation

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- Compte Expo
- Cloudinary (optionnel)

### Backend

```bash
cd server
cp .env.example .env   # Configurer les variables
npm install
npm run dev
```

### Mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

Scanner le QR code avec Expo Go (iOS) ou un émulateur.

## Partage avec le groupe

### Option 1 - GitHub (recommandé)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-compte/findit.git
git push -u origin main
```

Chaque membre fait ensuite :

```bash
git clone https://github.com/votre-compte/findit.git
cd findit
npm install --prefix server && npm install --prefix mobile
```

### Option 2 - Zip

```bash
# Exclure node_modules
git archive -o findit.zip HEAD
```

### Option 3 - Partage local
Copier le dossier complet (sans `node_modules/` ni `.expo/`).

## Variables d'environnement

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre_secret
JWT_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Scripts principaux

| Commande | Description |
|----------|-------------|
| `npm run dev` (server) | Lance le serveur avec nodemon |
| `npx expo start` (mobile) | Lance le bundler Expo |
| `npm run lint` | Vérifie le code |