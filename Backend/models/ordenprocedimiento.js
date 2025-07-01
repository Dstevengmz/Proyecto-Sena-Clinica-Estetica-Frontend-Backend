'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrdenProcedimiento extends Model {

    static associate(models) {
        OrdenProcedimiento.belongsTo(models.Ordenes, {
        foreignKey: "id_ordenes",
        as: "ordenes",
      });
    }
  }
  OrdenProcedimiento.init({
    id_orden: DataTypes.INTEGER,
    id_procedimiento: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrdenProcedimiento',
  });
  return OrdenProcedimiento;
};