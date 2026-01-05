const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  console.log('si le ando mandando ese requ', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token inválido' });
  }
};

/**
 * AuthMiddleware - Middleware de autenticación JWT
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja autenticación de requests
 * - Dependency Inversion: Usa TokenService para operaciones JWT
 */

const container = require('../config/di.container');

/**
 * Middleware de autenticación JWT
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {Function} next - Next middleware
 */
const authMiddleware = (req, res, next) => {
  try {
    const tokenService = container.get('tokenService');
    
    // Extraer token del header Authorization
    const authHeader = req.header('Authorization');
    const token = tokenService.extractTokenFromHeader(authHeader);
    
    // TEMPORAL: Comentado para testing en Postman
    // if (!token) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Token de acceso requerido',
    //     code: 'TOKEN_REQUIRED'
    //   });
    // }

    // Verificar token solo si existe
    if (token) {
      try {
        const decoded = tokenService.verifyToken(token);
        req.user = decoded;
        req.token = token;
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
          code: 'TOKEN_INVALID'
        });
      }
    } else {
      // Sin token, continuar sin autenticación para Postman
      req.user = null;
      req.token = null;
    }
    
    next();
  } catch (error) {
    // Error genérico
    return res.status(401).json({
      success: false,
      message: 'Error de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {Function} next - Next middleware
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const tokenService = container.get('tokenService');
    
    const authHeader = req.header('Authorization');
    const token = tokenService.extractTokenFromHeader(authHeader);
    
    if (token) {
      try {
        const decoded = tokenService.verifyToken(token);
        req.user = decoded;
        req.token = token;
        req.isAuthenticated = true;
      } catch (error) {
        // Si hay error con el token, continuar sin autenticación
        req.isAuthenticated = false;
      }
    } else {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    req.isAuthenticated = false;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
