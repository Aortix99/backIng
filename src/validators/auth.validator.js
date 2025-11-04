/**
 * AuthValidator - Validador para datos de autenticación
 * Aplica principios SOLID:
 * - Single Responsibility: Solo valida datos de autenticación
 * - Open/Closed: Extensible para nuevas validaciones
 */

class AuthValidator {
  /**
   * Valida los datos de login
   * @param {Object} data - Datos a validar
   * @returns {Object} Resultado de la validación
   */
  validateLogin(data) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!data || typeof data !== 'object') {
      result.isValid = false;
      result.errors.push('Los datos deben ser un objeto válido');
      return result;
    }

    // Validar email
    const emailValidation = this._validateEmail(data.email);
    if (!emailValidation.isValid) {
      result.isValid = false;
      result.errors.push(...emailValidation.errors);
    }

    // Validar contraseña
    const passwordValidation = this._validatePassword(data.password, { requireStrength: false });
    if (!passwordValidation.isValid) {
      result.isValid = false;
      result.errors.push(...passwordValidation.errors);
    }

    return result;
  }

  /**
   * Valida los datos de registro
   * @param {Object} data - Datos a validar
   * @returns {Object} Resultado de la validación
   */
  validateRegister(data) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!data || typeof data !== 'object') {
      result.isValid = false;
      result.errors.push('Los datos deben ser un objeto válido');
      return result;
    }

    // Validar nombre
    const nameValidation = this._validateName(data.name);
    if (!nameValidation.isValid) {
      result.isValid = false;
      result.errors.push(...nameValidation.errors);
    }

    // Validar email
    const emailValidation = this._validateEmail(data.email);
    if (!emailValidation.isValid) {
      result.isValid = false;
      result.errors.push(...emailValidation.errors);
    }

    // Validar contraseña con requisitos de fortaleza
    const passwordValidation = this._validatePassword(data.password, { requireStrength: true });
    if (!passwordValidation.isValid) {
      result.isValid = false;
      result.errors.push(...passwordValidation.errors);
    }

    // Validar confirmación de contraseña si existe
    if (data.confirmPassword !== undefined) {
      const confirmPasswordValidation = this._validatePasswordConfirmation(data.password, data.confirmPassword);
      if (!confirmPasswordValidation.isValid) {
        result.isValid = false;
        result.errors.push(...confirmPasswordValidation.errors);
      }
    }

    return result;
  }

  /**
   * Valida un email
   * @private
   * @param {string} email - Email a validar
   * @returns {Object} Resultado de la validación
   */
  _validateEmail(email) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!email) {
      result.isValid = false;
      result.errors.push('El email es requerido');
      return result;
    }

    if (typeof email !== 'string') {
      result.isValid = false;
      result.errors.push('El email debe ser una cadena de texto');
      return result;
    }

    // Expresión regular para validar email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      result.isValid = false;
      result.errors.push('El email no tiene un formato válido');
    }

    if (email.length > 255) {
      result.isValid = false;
      result.errors.push('El email no puede exceder 255 caracteres');
    }

    return result;
  }

  /**
   * Valida una contraseña
   * @private
   * @param {string} password - Contraseña a validar
   * @param {Object} options - Opciones de validación
   * @returns {Object} Resultado de la validación
   */
  _validatePassword(password, options = {}) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!password) {
      result.isValid = false;
      result.errors.push('La contraseña es requerida');
      return result;
    }

    if (typeof password !== 'string') {
      result.isValid = false;
      result.errors.push('La contraseña debe ser una cadena de texto');
      return result;
    }

    if (password.length < 6) {
      result.isValid = false;
      result.errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (password.length > 128) {
      result.isValid = false;
      result.errors.push('La contraseña no puede exceder 128 caracteres');
    }

    // Validaciones de fortaleza si se requiere
    if (options.requireStrength) {
      if (password.length < 8) {
        result.isValid = false;
        result.errors.push('Para mayor seguridad, la contraseña debe tener al menos 8 caracteres');
      }

      if (!/[A-Z]/.test(password)) {
        result.errors.push('La contraseña debe contener al menos una letra mayúscula');
      }

      if (!/[a-z]/.test(password)) {
        result.errors.push('La contraseña debe contener al menos una letra minúscula');
      }

      if (!/\d/.test(password)) {
        result.errors.push('La contraseña debe contener al menos un número');
      }

      // Contraseñas comunes
      const commonPasswords = ['123456', 'password', 'admin', 'qwerty', '123456789'];
      if (commonPasswords.includes(password.toLowerCase())) {
        result.isValid = false;
        result.errors.push('La contraseña es demasiado común, elige una más segura');
      }
    }

    return result;
  }

  /**
   * Valida el nombre
   * @private
   * @param {string} name - Nombre a validar
   * @returns {Object} Resultado de la validación
   */
  _validateName(name) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!name) {
      result.isValid = false;
      result.errors.push('El nombre es requerido');
      return result;
    }

    if (typeof name !== 'string') {
      result.isValid = false;
      result.errors.push('El nombre debe ser una cadena de texto');
      return result;
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      result.isValid = false;
      result.errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (trimmedName.length > 100) {
      result.isValid = false;
      result.errors.push('El nombre no puede exceder 100 caracteres');
    }

    // Validar que solo contenga letras, espacios y algunos caracteres especiales
    const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-\.\']+$/;
    if (!nameRegex.test(trimmedName)) {
      result.isValid = false;
      result.errors.push('El nombre solo puede contener letras, espacios, guiones y apostrofes');
    }

    return result;
  }

  /**
   * Valida la confirmación de contraseña
   * @private
   * @param {string} password - Contraseña original
   * @param {string} confirmPassword - Confirmación de contraseña
   * @returns {Object} Resultado de la validación
   */
  _validatePasswordConfirmation(password, confirmPassword) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!confirmPassword) {
      result.isValid = false;
      result.errors.push('La confirmación de contraseña es requerida');
      return result;
    }

    if (password !== confirmPassword) {
      result.isValid = false;
      result.errors.push('Las contraseñas no coinciden');
    }

    return result;
  }

  /**
   * Sanitiza datos de entrada
   * @param {Object} data - Datos a sanitizar
   * @returns {Object} Datos sanitizados
   */
  sanitizeInput(data) {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const sanitized = {};

    // Sanitizar email
    if (data.email && typeof data.email === 'string') {
      sanitized.email = data.email.toLowerCase().trim();
    }

    // Sanitizar nombre
    if (data.name && typeof data.name === 'string') {
      sanitized.name = data.name.trim().replace(/\s+/g, ' ');
    }

    // Mantener contraseña sin sanitizar (se manejará en el servicio)
    if (data.password) {
      sanitized.password = data.password;
    }

    if (data.confirmPassword) {
      sanitized.confirmPassword = data.confirmPassword;
    }

    return sanitized;
  }
}

module.exports = AuthValidator;