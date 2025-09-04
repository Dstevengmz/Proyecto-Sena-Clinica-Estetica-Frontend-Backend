'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrdenProcedimiento extends Model {

    static associate(models) {
        OrdenProcedimiento.belongsTo(models.ordenes, {
        foreignKey: "id_orden",
        as: "ordenes",
      });
    }
  }
  OrdenProcedimiento.init({
    id_orden: DataTypes.INTEGER,
    id_procedimiento: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ordenprocedimiento',
  });
  return OrdenProcedimiento;
};