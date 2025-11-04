/**
 * TokenService - Servicio para manejo de tokens JWT
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja operaciones de JWT
 * - Open/Closed: Extensible para diferentes tipos de tokens
 */

const jwt = require('jsonwebtoken');

class TokenService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'secret_key_default';
    this.defaultExpiration = '24h';
    this.refreshExpiration = '7d';
  }

  /**
   * Genera un token JWT
   * @param {Object} payload - Datos a incluir en el token
   * @param {string} expiresIn - Tiempo de expiración (opcional)
   * @returns {string} Token JWT
   */
  generateToken(payload, expiresIn = this.defaultExpiration) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('El payload debe ser un objeto válido');
      }

      // Remover campos sensibles del payload
      const cleanPayload = this._cleanPayload(payload);

      // Agregar timestamps
      cleanPayload.iat = Math.floor(Date.now() / 1000);
      
      return jwt.sign(cleanPayload, this.secretKey, { 
        expiresIn,
        issuer: 'ing-civil-backend',
        audience: 'ing-civil-frontend'
      });
    } catch (error) {
      throw new Error(`Error generando token: ${error.message}`);
    }
  }

  /**
   * Genera un refresh token
   * @param {Object} payload - Datos a incluir en el token
   * @returns {string} Refresh token JWT
   */
  generateRefreshToken(payload) {
    try {
      const cleanPayload = {
        id: payload.id,
        type: 'refresh'
      };

      return jwt.sign(cleanPayload, this.secretKey, { 
        expiresIn: this.refreshExpiration,
        issuer: 'ing-civil-backend',
        audience: 'ing-civil-frontend'
      });
    } catch (error) {
      throw new Error(`Error generando refresh token: ${error.message}`);
    }
  }

  /**
   * Verifica un token JWT
   * @param {string} token - Token a verificar
   * @returns {Object} Payload decodificado
   */
  verifyToken(token) {
    try {
      console.log('TokenService.verifyToken - token recibido:', token ? 'SI' : 'NO', typeof token);
      
      if (!token || typeof token !== 'string') {
        console.log('TokenService.verifyToken - Token inválido o no es string');
        throw new Error('Token inválido');
      }

      // Verificación temporal sin issuer/audience para debugging
      console.log('TokenService.verifyToken - Verificando token con JWT...');
      const decoded = jwt.verify(token, this.secretKey);
      console.log('TokenService.verifyToken - Token verificado exitosamente:', decoded);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const expiredError = new Error('Token expirado');
        expiredError.statusCode = 401;
        expiredError.code = 'TOKEN_EXPIRED';
        throw expiredError;
      }
      
      if (error.name === 'JsonWebTokenError') {
        const invalidError = new Error('Token inválido');
        invalidError.statusCode = 401;
        invalidError.code = 'TOKEN_INVALID';
        throw invalidError;
      }

      throw error;
    }
  }

  /**
   * Decodifica un token sin verificarlo (útil para obtener info del payload)
   * @param {string} token - Token a decodificar
   * @returns {Object} Payload decodificado
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error(`Error decodificando token: ${error.message}`);
    }
  }

  /**
   * Extrae el token del header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} Token extraído o null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Verifica si un token está próximo a expirar
   * @param {string} token - Token a verificar
   * @param {number} thresholdMinutes - Minutos antes de expiración (default: 30)
   * @returns {boolean} True si está próximo a expirar
   */
  isTokenNearExpiration(token, thresholdMinutes = 30) {
    try {
      const decoded = this.decodeToken(token);
      
      if (!decoded.exp) {
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = decoded.exp;
      const thresholdTime = thresholdMinutes * 60;

      return (expirationTime - currentTime) <= thresholdTime;
    } catch (error) {
      return true; // Si hay error, asumir que debe renovarse
    }
  }

  /**
   * Limpia el payload removiendo campos sensibles
   * @private
   * @param {Object} payload - Payload original
   * @returns {Object} Payload limpio
   */
  _cleanPayload(payload) {
    const sensitiveFields = ['password', 'hash', 'salt', 'token', 'secret'];
    const cleanPayload = { ...payload };

    sensitiveFields.forEach(field => {
      delete cleanPayload[field];
    });

    return cleanPayload;
  }
}

module.exports = TokenService;