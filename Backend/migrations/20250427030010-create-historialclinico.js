'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historialclinicos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enfermedades: {
        type: Sequelize.TEXT
      },
      alergias: {
        type: Sequelize.TEXT
      },
      cirugias_previas: {
        type: Sequelize.TEXT
      },
      condiciones_piel: {
        type: Sequelize.TEXT
      },
      embarazo_lactancia: {
        type: Sequelize.BOOLEAN
      },
      medicamentos: {
        type: Sequelize.TEXT
      },
      consume_tabaco: {
        type: Sequelize.BOOLEAN
      },
      consume_alcohol: {
        type: Sequelize.BOOLEAN
      },
      usa_anticonceptivos: {
        type: Sequelize.BOOLEAN
      },
      detalles_anticonceptivos: {
        type: Sequelize.TEXT
      },
      diabetes: {
        type: Sequelize.BOOLEAN
      },
      hipertension: {
        type: Sequelize.BOOLEAN
      },
      historial_cancer: {
        type: Sequelize.BOOLEAN
      },
      problemas_coagulacion: {
        type: Sequelize.BOOLEAN
      },
      epilepsia: {
        type: Sequelize.BOOLEAN
      },
      otras_condiciones: {
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
    await queryInterface.dropTable('historialclinicos');
  }
};