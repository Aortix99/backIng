/**
 * UserRepository - Repositorio para operaciones de usuario
 * Aplica principios SOLID:
 * - Single Responsibility: Solo maneja operaciones de base de datos de usuarios
 * - Dependency Inversion: Abstrae las operaciones de BD
 */

const { User } = require('../models');

class UserRepository {
  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ 
        where: { email },
        attributes: ['id', 'email', 'name', 'password', 'createdAt', 'updatedAt']
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findById(id) {
    try {
      return await User.findByPk(id, {
        attributes: ['id', 'email', 'name', 'createdAt', 'updatedAt']
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un usuario por ID
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateById(id, userData) {
    try {
      const [updatedRowsCount] = await User.update(userData, {
        where: { id }
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} True si se eliminó, false si no se encontró
   */
  async deleteById(id) {
    try {
      const deletedRowsCount = await User.destroy({
        where: { id }
      });

      return deletedRowsCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios con paginación
   * @param {number} offset - Offset para paginación
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>} Usuarios y total
   */
  async findAll(offset = 0, limit = 10) {
    try {
      const { count, rows } = await User.findAndCountAll({
        attributes: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
        offset,
        limit,
        order: [['createdAt', 'DESC']]
      });

      return {
        users: rows,
        total: count,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserRepository;