"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("citas", "examenes_cargados", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "examenes_requeridos", 
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("citas", "examenes_cargados");
  },
};
