const swaggerJsdoc = require('swagger-jsdoc');
const env = require('../config/env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FindIt API',
      version: '1.0.0',
      description: 'API REST de la plateforme intelligente d\'objets perdus et retrouvés',
      contact: {
        name: 'FindIt Team',
        email: 'contact@findit.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        LostReport: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  publicId: { type: 'string' },
                },
              },
            },
            city: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['Point'] },
                coordinates: { type: 'array', items: { type: 'number' } },
              },
            },
            lostDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'resolved', 'expired'] },
            reward: { type: 'number' },
          },
        },
        FoundReport: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  publicId: { type: 'string' },
                },
              },
            },
            city: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['Point'] },
                coordinates: { type: 'array', items: { type: 'number' } },
              },
            },
            foundDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'returned', 'expired'] },
            heldAt: { type: 'string' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            lostReport: { type: 'string' },
            foundReport: { type: 'string' },
            score: { type: 'number', minimum: 0, maximum: 100 },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
            notifiedUsers: { type: 'array', items: { type: 'string' } },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sender: { type: 'string' },
            receiver: { type: 'string' },
            reportId: { type: 'string' },
            reportType: { type: 'string', enum: ['lost', 'found'] },
            content: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            type: { type: 'string', enum: ['match_found', 'new_message', 'report_resolved', 'admin_alert'] },
            data: { type: 'object' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentification et gestion du profil' },
      { name: 'Lost', description: 'Objets perdus' },
      { name: 'Found', description: 'Objets trouvés' },
      { name: 'Search', description: 'Recherche avancée' },
      { name: 'Matches', description: 'Correspondances intelligentes' },
      { name: 'Messages', description: 'Messagerie interne' },
      { name: 'Notifications', description: 'Notifications' },
      { name: 'Admin', description: 'Administration' },
      { name: 'Map', description: 'Carte interactive' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Inscription',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Compte créé avec succès' }, 400: { description: 'Erreur de validation' } },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Connexion',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Connexion réussie' }, 401: { description: 'Identifiants incorrects' } },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Profil utilisateur connecté',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profil retourné' } },
        },
      },
      '/api/lost': {
        get: {
          tags: ['Lost'],
          summary: 'Liste des objets perdus',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'resolved', 'expired'] } },
          ],
          responses: { 200: { description: 'Liste des objets perdus' } },
        },
        post: {
          tags: ['Lost'],
          summary: 'Créer un signalement perdu',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'category', 'city', 'coordinates', 'date'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    city: { type: 'string' },
                    coordinates: { type: 'string', description: '[lng, lat]' },
                    date: { type: 'string', format: 'date-time' },
                    reward: { type: 'number' },
                    images: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Signalement créé' } },
        },
      },
      '/api/found': {
        get: {
          tags: ['Found'],
          summary: 'Liste des objets trouvés',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'returned', 'expired'] } },
          ],
          responses: { 200: { description: 'Liste des objets trouvés' } },
        },
        post: {
          tags: ['Found'],
          summary: 'Créer un signalement trouvé',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'category', 'city', 'coordinates', 'date'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    city: { type: 'string' },
                    coordinates: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    heldAt: { type: 'string' },
                    images: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Signalement créé' } },
        },
      },
      '/api/search': {
        get: {
          tags: ['Search'],
          summary: 'Recherche globale',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Mot-clé' },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'lat', in: 'query', schema: { type: 'number' } },
            { name: 'lng', in: 'query', schema: { type: 'number' } },
            { name: 'radius', in: 'query', schema: { type: 'number' }, description: 'Rayon en km' },
          ],
          responses: { 200: { description: 'Résultats de recherche' } },
        },
      },
      '/api/matches': {
        get: {
          tags: ['Matches'],
          summary: 'Mes correspondances',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Liste des correspondances' } },
        },
      },
      '/api/messages/conversations': {
        get: {
          tags: ['Messages'],
          summary: 'Liste des conversations',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Conversations' } },
        },
      },
      '/api/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Mes notifications',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Notifications' } },
        },
      },
      '/api/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Statistiques globales',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Statistiques' } },
        },
      },
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Liste des utilisateurs',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Utilisateurs' } },
        },
      },
      '/api/admin/reports': {
        get: {
          tags: ['Admin'],
          summary: 'Liste des signalements',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Signalements' } },
        },
      },
      '/api/map/reports': {
        get: {
          tags: ['Map'],
          summary: 'Signalements pour la carte',
          parameters: [
            { name: 'lat', in: 'query', schema: { type: 'number' } },
            { name: 'lng', in: 'query', schema: { type: 'number' } },
            { name: 'radius', in: 'query', schema: { type: 'number' } },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['lost', 'found'] } },
          ],
          responses: { 200: { description: 'Signalements géolocalisés' } },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
