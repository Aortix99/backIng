/**
 * PasswordService - Servicio para manejo de contraseñas
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja operaciones de contraseñas
 * - Open/Closed: Extensible para diferentes algoritmos de hash
 */

const bcrypt = require('bcrypt');

class PasswordService {
  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hashea una contraseña
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Contraseña hasheada
   */
  async hash(password) {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('La contraseña debe ser una cadena de texto válida');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Compara una contraseña con su hash
   * @param {string} password - Contraseña en texto plano
   * @param {string} hashedPassword - Contraseña hasheada
   * @returns {Promise<boolean>} True si coinciden, false si no
   */
  async compare(password, hashedPassword) {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      // En caso de error en la comparación, retornar false por seguridad
      return false;
    }
  }

  /**
   * Valida la fortaleza de una contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} Resultado de la validación
   */
  validateStrength(password) {
    const result = {
      isValid: true,
      score: 0,
      feedback: []
    };

    if (!password || typeof password !== 'string') {
      result.isValid = false;
      result.feedback.push('La contraseña debe ser una cadena de texto válida');
      return result;
    }

    // Longitud mínima
    if (password.length < 6) {
      result.isValid = false;
      result.feedback.push('La contraseña debe tener al menos 6 caracteres');
    } else if (password.length >= 8) {
      result.score += 1;
    }

    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Incluye al menos una letra mayúscula');
    }

    // Contiene minúsculas
    if (/[a-z]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Incluye al menos una letra minúscula');
    }

    // Contiene números
    if (/\d/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Incluye al menos un número');
    }

    // Contiene caracteres especiales
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Incluye al menos un caracter especial');
    }

    // Si no tiene feedback negativo pero score bajo, dar sugerencias
    if (result.isValid && result.score < 3) {
      result.feedback.push('Considera usar una contraseña más fuerte');
    }

    return result;
  }
}

module.exports = PasswordService;