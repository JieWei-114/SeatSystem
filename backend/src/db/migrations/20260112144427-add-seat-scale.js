'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('seats', 'scaleX', { type: Sequelize.FLOAT, defaultValue: 1 });
    await queryInterface.addColumn('seats', 'scaleY', { type: Sequelize.FLOAT, defaultValue: 1 });
    await queryInterface.addColumn('seats', 'width', { type: Sequelize.FLOAT, allowNull: true });
    await queryInterface.addColumn('seats', 'height', { type: Sequelize.FLOAT, allowNull: true });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('seats', 'scaleX');
    await queryInterface.removeColumn('seats', 'scaleY');
    await queryInterface.removeColumn('seats', 'width');
    await queryInterface.removeColumn('seats', 'height');
  },
};
