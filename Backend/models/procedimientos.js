'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Procedimientos extends Model {
    static associate(models) {
    }
  }
  Procedimientos.init({
    nombre: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    precio: DataTypes.FLOAT,
    requiere_evaluacion: DataTypes.BOOLEAN,
    duracion: DataTypes.STRING,
    examenes_requeridos: DataTypes.TEXT,
    imagen: DataTypes.STRING,
    categoria: DataTypes.STRING,
    recomendaciones_previas: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Procedimientos',
  });
  return Procedimientos;
};