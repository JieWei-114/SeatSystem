'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('floors', {
      id: { 
        type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true 
      },
      buildingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'buildings', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { 
        type: Sequelize.STRING, allowNull: false 
      },
      description: { 
        type: Sequelize.TEXT, allowNull: false 
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
    await queryInterface.dropTable('floors');
  },
};