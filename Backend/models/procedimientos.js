'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Procedimientos extends Model {
    static associate(models) {
      Procedimientos.hasMany(models.Citas, {
        foreignKey: 'id_procedimiento',
        as: 'citas'
      });
    }
  }
  Procedimientos.init({
    nombre: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    precio: DataTypes.DECIMAL,
    duracion: DataTypes.INTEGER,
    requiere_evaluacion: DataTypes.BOOLEAN,
    examenes_requeridos: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Procedimientos',
  });
  return Procedimientos;
};