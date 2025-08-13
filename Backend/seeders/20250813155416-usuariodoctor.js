'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash('123456', 10);
    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'Doctor x',
        estado: true,
        tipodocumento: 'Cedula de Ciudadania',
        numerodocumento: '1245789423',
        correo: 'doctor@gmail.com',
        contrasena: password,
        rol: 'doctor',
        telefono: 3001234567,
        direccion: 'Cra 1 # 2-3',
        fecha_registro: new Date(),
        genero: 'Masculino',
        fecha_nacimiento: new Date('1985-05-10'),
        ocupacion: 'Médico Estético',
        estado_civil: 'Soltero',
        terminos_condiciones: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', { correo: 'doctor@gmail.com' });
  }
};
