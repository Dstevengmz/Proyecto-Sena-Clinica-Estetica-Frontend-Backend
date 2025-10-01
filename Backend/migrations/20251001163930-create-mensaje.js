"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mensaje", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "usuarios", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      id_asistente: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "usuarios", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "citas", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      remitente: {
        type: Sequelize.ENUM("usuario", "asistente"),
        allowNull: false,
      },
      texto: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fecha_envio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      leido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("mensaje");
  },
};
