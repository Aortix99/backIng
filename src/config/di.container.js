/**
 * DIContainer - Contenedor de inyección de dependencias
 * Aplica principios SOLID:
 * - Dependency Inversion: Gestiona las dependencias de manera centralizada
 * - Single Responsibility: Solo se encarga de crear e inyectar dependencias
 */

// Importar todas las clases
const AuthController = require('../controllers/auth.controller');
const AuthService = require('../services/auth.service');
const UserRepository = require('../repositories/user.repository');
const PasswordService = require('../services/password.service');
const TokenService = require('../services/token.service');
const AuthValidator = require('../validators/auth.validator');

class DIContainer {
  constructor() {
    this.dependencies = new Map();
    this._initializeDependencies();
  }

  /**
   * Inicializa todas las dependencias
   * @private
   */
  _initializeDependencies() {
    // Servicios base (sin dependencias)
    this.dependencies.set('passwordService', new PasswordService());
    this.dependencies.set('tokenService', new TokenService());
    this.dependencies.set('authValidator', new AuthValidator());
    
    // Repositorios
    this.dependencies.set('userRepository', new UserRepository());
    
    // Servicios con dependencias
    this.dependencies.set('authService', new AuthService(
      this.get('userRepository'),
      this.get('passwordService'),
      this.get('tokenService')
    ));
    
    // Controladores
    this.dependencies.set('authController', new AuthController(
      this.get('authService'),
      this.get('authValidator')
    ));
  }

  /**
   * Obtiene una dependencia por nombre
   * @param {string} name - Nombre de la dependencia
   * @returns {Object} Instancia de la dependencia
   */
  get(name) {
    if (!this.dependencies.has(name)) {
      throw new Error(`Dependencia '${name}' no encontrada`);
    }
    
    return this.dependencies.get(name);
  }

  /**
   * Registra una nueva dependencia
   * @param {string} name - Nombre de la dependencia
   * @param {Object} instance - Instancia de la dependencia
   */
  register(name, instance) {
    this.dependencies.set(name, instance);
  }

  /**
   * Verifica si una dependencia está registrada
   * @param {string} name - Nombre de la dependencia
   * @returns {boolean} True si existe, false si no
   */
  has(name) {
    return this.dependencies.has(name);
  }

  /**
   * Obtiene todas las dependencias registradas
   * @returns {Array<string>} Nombres de las dependencias
   */
  getRegisteredDependencies() {
    return Array.from(this.dependencies.keys());
  }
}

// Crear instancia singleton
const container = new DIContainer();

module.exports = container;