/**
 * Router principal - Configuración de rutas
 * Aplica principios SOLID y Clean Code:
 * - Single Responsibility: Solo configura rutas
 * - Open/Closed: Fácil agregar nuevas rutas sin modificar existentes
 * - Dependency Inversion: Usa contenedor DI para dependencias
 */

const express = require('express');
const router = express.Router();
const container = require('../config/di.container');

// Importar middlewares
const { authMiddleware } = require('../middlewares/auth.middleware');

// Importar servicios legacy (por compatibilidad)
const { getRequest } = require('../bussines/request/services/get-request.js');
const { insertRequest } = require('../bussines/request/services/insert-request.js');
const { deleteRequest } = require('../bussines/request/services/delete-request.js');
const { insertUser } = require('../bussines/login/servicie/insert-empolye.js');
const { loginUser } = require('../bussines/login/servicie/searh-user.js');
const { zapataCombinadaService } = require('../bussines/zapata-combinda/servicio/zapata-combinada.js');
const { zapataCuadradaCombinadaService } = require('../bussines/zapata-cuadrada-aislada/servicio/cuadrada-servicio.js');

// Obtener controladores del contenedor DI
const authController = container.get('authController');

// ============================================
// RUTAS PÚBLICAS (sin autenticación requerida)
// ============================================

/**
 * @route POST /api/login
 * @desc Iniciar sesión (nuevo endpoint con clean architecture)
 * @access Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route POST /api/register  
 * @desc Registrar nuevo usuario (nuevo endpoint con clean architecture)
 * @access Public
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// RUTAS LEGACY (mantener por compatibilidad)
// ============================================

/**
 * @route POST /api/insert-user
 * @desc Insertar usuario (endpoint legacy)
 * @access Public
 * @deprecated Usar /register en su lugar
 */
router.post('/insert-user', insertUser);

/**
 * @route POST /api/login-user
 * @desc Login usuario (endpoint legacy)
 * @access Public
 * @deprecated Usar /login en su lugar
 */
router.post('/login-user', loginUser);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación JWT)
// ============================================

/**
 * @route GET /api/verify-token
 * @desc Verificar validez del token
 * @access Protected
 */
router.get('/verify-token', authMiddleware, (req, res, next) => authController.verifyToken(req, res, next));

/**
 * @route GET /api/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Protected
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userRepository = container.get('userRepository');
    const user = await userRepository.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// RUTAS DE REQUESTS (protegidas)
// ============================================
router.post('/get-request', authMiddleware, getRequest);
router.post('/insert-request', authMiddleware, insertRequest);
router.post('/delete-request', authMiddleware, deleteRequest);

// ============================================
// RUTAS DE CÁLCULOS ESTRUCTURALES (protegidas)
// ============================================
router.post('/zapata-combinada', authMiddleware, zapataCombinadaService);
router.post('/zapata-cuadrada-aislada', authMiddleware, zapataCuadradaCombinadaService);

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN PARA RUTAS DE MÓDULOS
// ============================================

// TEMPORALMENTE COMENTADO - Puede estar causando error path-to-regexp
// router.use('/employees', authMiddleware);
// router.use('/requests', authMiddleware);  
// router.use('/pre-calculo', authMiddleware);
// router.use('/zapata-combinda', authMiddleware);
// router.use('/zapata-cuadrada-aislada', authMiddleware);

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================

// MANEJO DE RUTAS NO ENCONTRADAS COMENTADO TEMPORALMENTE
// (puede estar causando el error path-to-regexp)
/*
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`
  });
});
*/

module.exports = router;

