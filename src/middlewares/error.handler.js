/**
 * ErrorHandler - Middleware para manejo centralizado de errores
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja errores de la aplicación
 * - Open/Closed: Extensible para nuevos tipos de errores
 */

/**
 * Clase para errores personalizados de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Clase para errores de validación
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Clase para errores de autenticación
 */
class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Clase para errores de autorización
 */
class AuthorizationError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Clase para errores de recurso no encontrado
 */
class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * Clase para errores de conflicto (ej: recurso ya existe)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflicto de recursos') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Middleware para manejo de errores no encontrados (404)
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {Function} next - Next middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Middleware principal de manejo de errores
 * @param {Error} error - Error capturado
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {Function} next - Next middleware
 */
const errorHandler = (error, req, res, next) => {
  let { statusCode, message, code } = error;

  // Log del error para debugging
  console.error('Error captured:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Manejo específico de errores de bases de datos
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Error de validación en base de datos';
    
    const validationErrors = error.errors?.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    })) || [];

    return res.status(statusCode).json({
      success: false,
      message,
      code,
      errors: validationErrors,
      timestamp: new Date().toISOString()
    });
  }

  // Manejo de errores de unicidad en base de datos
  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'CONFLICT_ERROR';
    message = 'El recurso ya existe';
    
    const conflictErrors = error.errors?.map(err => ({
      field: err.path,
      message: `${err.path} ya está en uso`,
      value: err.value
    })) || [];

    return res.status(statusCode).json({
      success: false,
      message,
      code,
      errors: conflictErrors,
      timestamp: new Date().toISOString()
    });
  }

  // Manejo de errores de conexión a base de datos
  if (error.name === 'SequelizeConnectionError') {
    statusCode = 503;
    code = 'DATABASE_CONNECTION_ERROR';
    message = 'Error de conexión a la base de datos';
  }

  // Manejo de errores de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'TOKEN_INVALID';
    message = 'Token inválido';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expirado';
  }

  // Si no es un error operacional, convertir a error genérico
  if (!error.isOperational) {
    statusCode = 500;
    code = 'INTERNAL_ERROR';
    message = process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message;
  }

  // Estructura de respuesta de error consistente
  const errorResponse = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  };

  // Incluir errores específicos si existen
  if (error.errors && Array.isArray(error.errors)) {
    errorResponse.errors = error.errors;
  }

  // Incluir stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      name: error.name,
      originalMessage: error.message
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Wrapper para funciones async que captura errores automáticamente
 * @param {Function} fn - Función async a envolver
 * @returns {Function} Función envuelta que maneja errores
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware de rate limiting por IP
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Middleware de rate limiting
 */
const rateLimitHandler = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    maxRequests = 100,
    message = 'Demasiadas solicitudes, intenta más tarde'
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(clientIP)) {
      requests.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = requests.get(clientIP);
    
    if (now > clientData.resetTime) {
      requests.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.count >= maxRequests) {
      const error = new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
      return next(error);
    }

    clientData.count++;
    next();
  };
};

module.exports = {
  // Clases de errores
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  
  // Middlewares
  errorHandler,
  notFoundHandler,
  asyncHandler,
  rateLimitHandler
};