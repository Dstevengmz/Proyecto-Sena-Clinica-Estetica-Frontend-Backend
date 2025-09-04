'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('procedimientos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      precio: {
        type: Sequelize.FLOAT
      },
      requiere_evaluacion: {
        type: Sequelize.BOOLEAN
      },
      duracion: {
        type: Sequelize.STRING
      },
      examenes_requeridos: {
        type: Sequelize.TEXT
      },
      imagen: {
        type: Sequelize.STRING
      },
      categoria: {
        type: Sequelize.STRING
      },
      recomendaciones_previas: {
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
    await queryInterface.dropTable('procedimientos');
  }
};