"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notificaciones", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "citas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      tipo: {
        type: Sequelize.ENUM(
          "cita",
          "confirmacion_cita",
          "examenes",
          "sistema"
        ),
        allowNull: false,
      },

      mensaje: {
        type: Sequelize.TEXT,
      },
      leida: {
        type: Sequelize.BOOLEAN,
      },
      archivada: {
        type: Sequelize.BOOLEAN,
      },
      fecha: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("notificaciones");
  },
};
