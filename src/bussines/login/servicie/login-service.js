/**
 * AuthService - Servicio de autenticación
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja lógica de autenticación
 * - Dependency Inversion: Recibe dependencias por inyección
 * - Interface Segregation: Métodos específicos y cohesivos
 */

class AuthService {
  constructor(userRepository, passwordService, tokenService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  /**
   * Autentica un usuario con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Token y datos del usuario
   */
  async login(email, password) {
    try {
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
      }

      // Verificar contraseña
      const isValidPassword = await this.passwordService.compare(password, user.password);
      
      if (!isValidPassword) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
      }

      // Generar token
      const token = this.tokenService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      return {
        token,
        user: this._formatUserResponse(user)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Token y datos del usuario registrado
   */
  async register(userData) {
    try {
      const { email, password, name } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findByEmail(email);
      
      if (existingUser) {
        const error = new Error('El usuario ya existe');
        error.statusCode = 409;
        throw error;
      }

      // Encriptar contraseña
      const hashedPassword = await this.passwordService.hash(password);

      // Crear nuevo usuario
      const newUser = await this.userRepository.create({
        email,
        password: hashedPassword,
        name
      });

      // Generar token
      const token = this.tokenService.generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      });

      return {
        token,
        user: this._formatUserResponse(newUser)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica la validez de un token
   * @param {Object} userPayload - Payload del usuario del token
   * @returns {Promise<Object>} Datos del usuario
   */
  async verifyToken(userPayload) {
    try {
      const user = await this.userRepository.findById(userPayload.id);
      
      if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
      }

      return {
        user: this._formatUserResponse(user)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Formatea la respuesta del usuario (elimina campos sensibles)
   * @private
   * @param {Object} user - Usuario de la base de datos
   * @returns {Object} Usuario formateado
   */
  _formatUserResponse(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
  }
}

module.exports = AuthService;