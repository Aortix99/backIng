/**
 * Servidor de prueba para identificar el problema de path-to-regexp
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares básicos
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://front-ing-git-main-andres-ortizs-projects-ce0897f6.vercel.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba simple
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor de prueba funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rutas básicas de auth sin dependencias
app.post('/api/test-login', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de prueba funcionando',
    data: { test: true }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API saludable',
    timestamp: new Date().toISOString()
  });
});

// Error handler básico
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba corriendo en http://localhost:${PORT}`);
  console.log('Prueba los endpoints:');
  console.log(`- GET http://localhost:${PORT}/`);
  console.log(`- GET http://localhost:${PORT}/api/health`);
  console.log(`- POST http://localhost:${PORT}/api/test-login`);
});