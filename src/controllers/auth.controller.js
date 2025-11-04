/**
 * AuthController - Controlador para manejo de autenticación
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja autenticación
 * - Dependency Inversion: Depende de abstracciones (servicios)
 * - Open/Closed: Abierto para extensión, cerrado para modificación
 */

class AuthController {
  constructor(authService, validator) {
    this.authService = authService;
    this.validator = validator;
  }

  /**
   * Maneja el login de usuarios
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async login(req, res, next) {
    try {
      // Validar datos de entrada
      const validationResult = this.validator.validateLogin(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: validationResult.errors
        });
      }

      const { email, password } = req.body;
      
      // Ejecutar servicio de login
      const result = await this.authService.login(email, password);
      
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja el registro de usuarios
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async register(req, res, next) {
    try {
      // Validar datos de entrada
      const validationResult = this.validator.validateRegister(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: validationResult.errors
        });
      }

      // Ejecutar servicio de registro
      const result = await this.authService.register(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica el token del usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async verifyToken(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      // El middleware ya verificó el token, solo validamos que el usuario existe
      const result = await this.authService.validateUser(req.user.id);
      
      return res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user: result.user,
          tokenInfo: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            iat: req.user.iat,
            exp: req.user.exp
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;