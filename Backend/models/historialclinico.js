'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Historialclinico extends Model {
    
    static associate(models) {
      Historialclinico.belongsTo(models.usuarios, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    });
    }
  }
  Historialclinico.init({
    id_usuario: DataTypes.INTEGER,
    enfermedades: DataTypes.TEXT,
    alergias: DataTypes.TEXT,
    cirugias_previas: DataTypes.TEXT,
    condiciones_piel: DataTypes.TEXT,
    embarazo_lactancia: DataTypes.BOOLEAN,
    medicamentos: DataTypes.TEXT,
    consume_tabaco: DataTypes.BOOLEAN,
    consume_alcohol: DataTypes.BOOLEAN,
    usa_anticonceptivos: DataTypes.BOOLEAN,
    detalles_anticonceptivos: DataTypes.TEXT,
    diabetes: DataTypes.BOOLEAN,
    hipertension: DataTypes.BOOLEAN,
    historial_cancer: DataTypes.BOOLEAN,
    problemas_coagulacion: DataTypes.BOOLEAN,
    epilepsia: DataTypes.BOOLEAN,
    otras_condiciones: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'historialclinico',
  });
  return Historialclinico;
};