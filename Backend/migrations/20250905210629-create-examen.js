'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('examens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_cita: {
        type: Sequelize.INTEGER,
        references: {
          model: 'citas',
          key: 'id',    
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre_examen: {
        type: Sequelize.STRING
      },
      archivo_examen: {
        type: Sequelize.STRING
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('examens');
  }
};