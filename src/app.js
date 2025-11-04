/**
 * App principal - Configuración de Express
 * Aplica principios SOLID y Clean Code:
 * - Single Responsibility: Solo configura la aplicación Express
 * - Dependency Inversion: Usa middlewares y rutas modulares
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar middlewares
const { errorHandler, notFoundHandler, rateLimitHandler } = require('./middlewares/error.handler');

// Importar rutas
const router = require('./router/router.js');

const app = express();

// ============================================
// CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ============================================

// Rate limiting (protección contra abuso)
app.use(rateLimitHandler({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 1000, // 1000 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde'
}));

// CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (importante para rate limiting con IPs reales)
app.set('trust proxy', 1);

// ============================================
// LOGGING DE REQUESTS (solo en desarrollo)
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ============================================
// RUTAS PRINCIPALES
// ============================================

// Health check básico
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ing Civil Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API 
app.use('/api', router);

// ============================================
// MIDDLEWARES DE MANEJO DE ERRORES
// ============================================

// Middleware para rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// Middleware de manejo centralizado de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
