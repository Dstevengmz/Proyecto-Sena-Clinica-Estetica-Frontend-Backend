"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("consentimientos", {
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
      fecha_firma: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      texto_terminos: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      ruta_pdf: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      hash_pdf: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ip_firma: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable("consentimientos");
  },
};
