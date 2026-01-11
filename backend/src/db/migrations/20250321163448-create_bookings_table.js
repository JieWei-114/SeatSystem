'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true
      },
      seatId: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'seats', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      date: {
        type: Sequelize.STRING, allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE, allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE, allowNull: false
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('bookings');
  },
};