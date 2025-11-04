'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID autoincremental del usuario'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del usuario'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Correo electrónico del usuario'
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Contraseña del usuario'
      },
      role: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Rol del usuario (false: Empleado, true: Admin)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación del usuario'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización del usuario'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
