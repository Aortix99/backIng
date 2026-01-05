/**
 * AuthService - Servicio de autenticación
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja lógica de autenticación
 * - Dependency Inversion: Depende de abstracciones (repositorios, servicios)
 * - Open/Closed: Abierto para extensión, cerrado para modificación
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
   * @returns {Promise<Object>} Resultado del login
   */
  async login(email, password) {
    try {
      // CREDENCIALES QUEMADAS PARA TESTING
      const HARDCODED_EMAIL = 'acocogollo@gmail.com';
      const HARDCODED_PASSWORD = '1003435599A@a';

      // Verificar con credenciales quemadas
      if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
        const token = this.tokenService.generateToken({
          id: 1,
          email: HARDCODED_EMAIL,
          name: 'Usuario de Prueba',
          role: 'admin'
        });

        return {
          user: {
            id: 1,
            email: HARDCODED_EMAIL,
            name: 'Usuario de Prueba',
            role: 'admin'
          },
          token,
          message: 'Login exitoso (credenciales de prueba)'
        };
      }

      // Buscar usuario por email en BD
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        throw new Error('Credenciales incorrectas');
      }

      // Verificar contraseña en BD
      const isPasswordValid = await this.passwordService.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Credenciales incorrectas');
      }

      // Generar token JWT
      const token = this.tokenService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      // Retornar usuario sin contraseña y token
      const { password: _, ...userWithoutPassword } = user.toJSON();

      return {
        user: userWithoutPassword,
        token,
        message: 'Login exitoso'
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async register(userData) {
    try {
      const { name, email, password } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findByEmail(email);
      
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Hashear contraseña
      const hashedPassword = await this.passwordService.hash(password);

      // Crear usuario
      const newUser = await this.userRepository.create({
        name,
        email,
        password: hashedPassword
      });

      // Generar token JWT
      const token = this.tokenService.generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      });

      // Retornar usuario sin contraseña y token
      const { password: _, ...userWithoutPassword } = newUser.toJSON();

      return {
        user: userWithoutPassword,
        token,
        message: 'Usuario registrado exitosamente'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica un token JWT
   * @param {string} token - Token a verificar
   * @returns {Promise<Object>} Usuario decodificado
   */
  async verifyToken(token) {
    try {
      // Verificar token
      const decoded = this.tokenService.verifyToken(token);
      
      // Buscar usuario para asegurar que aún existe
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Retornar usuario sin contraseña
      const { password: _, ...userWithoutPassword } = user.toJSON();

      return {
        user: userWithoutPassword,
        message: 'Token válido'
      };
    } catch (error) {
      throw new Error(`Error verificando token: ${error.message}`);
    }
  }

  /**
   * Valida que un usuario aún existe en la base de datos
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Usuario sin contraseña
   */
  async validateUser(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Retornar usuario sin contraseña
      const { password: _, ...userWithoutPassword } = user.toJSON();

      return {
        user: userWithoutPassword,
        message: 'Usuario válido'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza la información de un usuario
   * @param {number} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(userId, updateData) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si se está actualizando la contraseña, hashearla
      if (updateData.password) {
        updateData.password = await this.passwordService.hash(updateData.password);
      }

      // Actualizar usuario
      const updatedUser = await this.userRepository.updateById(userId, updateData);

      if (!updatedUser) {
        throw new Error('Error al actualizar usuario');
      }

      return {
        user: updatedUser,
        message: 'Usuario actualizado exitosamente'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} oldPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Resultado de la operación
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isOldPasswordValid = await this.passwordService.compare(oldPassword, user.password);
      
      if (!isOldPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await this.passwordService.hash(newPassword);

      // Actualizar contraseña
      await this.userRepository.updateById(userId, { 
        password: hashedNewPassword 
      });

      return {
        message: 'Contraseña actualizada exitosamente'
      };

    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;