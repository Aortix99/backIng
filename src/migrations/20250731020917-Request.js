'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requests', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID autoincremental de la solicitud'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Código de la solicitud'
      },
      descriptions: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Descripción de la solicitud'
      },
      resumen: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Resumen de la solicitud'
      },
      id_employee: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del empleado asociado a la solicitud',
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación del registro'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización del registro'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('requests');
  }
};
