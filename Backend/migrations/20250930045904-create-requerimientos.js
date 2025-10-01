"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("requerimientos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "citas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      descripcion: {
        type: Sequelize.TEXT,
      },
      frecuencia: {
        type: Sequelize.INTEGER,
      },
      repeticiones: {
        type: Sequelize.INTEGER,
      },
      //se modifico aqui
      fecha_inicio: {
        type: Sequelize.DATEONLY,
      },
      fecha_fin: {
        type: Sequelize.DATE,
      },
      estado: {
        type: Sequelize.ENUM("pendiente", "realizada"),
        defaultValue: "pendiente",
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
    await queryInterface.dropTable("requerimientos");
  },
};
