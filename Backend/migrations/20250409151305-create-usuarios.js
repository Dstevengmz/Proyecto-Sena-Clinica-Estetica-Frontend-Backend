"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Usuarios", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING,
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      tipodocumento: {
        type: Sequelize.ENUM(
          "Cédula de Ciudadanía",
          "Pasaporte",
          "Documento de Identificación Extranjero",
          "Permiso Especial de Permanencia"
        ),
        allowNull: false,
      },
      numerodocumento: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      contrasena: {
        type: Sequelize.STRING,
      },
      rol: {
        type: Sequelize.ENUM("doctor", "usuario", "asistente"),
        allowNull: false,
      },
      telefono: {
        type: Sequelize.BIGINT,
      },
      direccion: {
        type: Sequelize.STRING,
      },
      fecha_registro: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      genero: {
        type: Sequelize.STRING,
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
      },
      ocupacion: {
        type: Sequelize.STRING,
      },
      estado_civil: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Usuarios");
  },
};
