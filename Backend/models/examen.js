'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class examen extends Model {
    static associate(models) {
       examen.belongsTo(models.citas, {
        foreignKey: 'id_cita',
        as: 'cita',
      });
    }
  }
  examen.init({
    id_cita: DataTypes.INTEGER,
    nombre_examen: DataTypes.STRING,
    archivo_examen: DataTypes.STRING,
    observaciones: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'examen',
  });
  return examen;
};