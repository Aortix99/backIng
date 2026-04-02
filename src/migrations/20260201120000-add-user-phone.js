'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(10),
      allowNull: true,
      unique: true,
      comment: 'Celular Colombia: 10 dígitos, inicia con 3',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'phone');
  },
};
