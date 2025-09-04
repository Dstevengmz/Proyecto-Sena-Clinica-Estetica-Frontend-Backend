'use strict';
require('dotenv').config();
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const nombre = process.env.ADMIN_NAME;
    const correo = process.env.ADMIN_CORREO;
    const tipodocumento=process.env.ADMIN_TIPODOCUMENTO;
    const numerodocumento=process.env.ADMIN_NUMERODOCUMENTO;
    const telefono=process.env.ADMIN_TELEFONO;
    const direccion=process.env.ADMIN_DIRECCION;
    const rol=process.env.ADMIN_ROL;
    const genero=process.env.ADMIN_GENERO;
    const fecha_nacimiento=process.env.ADMIN_FECHANACIMIENTO;
    const ocupacion=process.env.ADMIN_OCUPACION;
    const estado_civil=process.env.ADMIN_ESTADOCIVIL;
    const terminos_condiciones=process.env.ADMIN_TERMINOSCONDICIONES;
    const estado =process.env.ADMIN_ESTADO;
    const plainPassword = process.env.ADMIN_PASSWORD;
    const hashed = await bcrypt.hash(plainPassword, 10);
    
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre,
        estado,
        tipodocumento,
        numerodocumento,
        correo,
        contrasena: hashed,
        rol,
        telefono,
        direccion,
        fecha_registro: now,
        genero,
        fecha_nacimiento,
        ocupacion,
        estado_civil,
        terminos_condiciones,
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { correo: 'doctor@gmail.com' });
  }
};
