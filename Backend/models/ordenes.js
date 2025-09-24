"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ordenes extends Model {
    static associate(models) {
      Ordenes.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Ordenes.belongsToMany(models.procedimientos, {
        through: "ordenprocedimiento",
        foreignKey: "id_orden",
        otherKey: "id_procedimiento",
        as: "procedimientos",
      });
    }
  }
  Ordenes.init(
    {
      id_usuario: DataTypes.INTEGER,
      fecha_creacion: DataTypes.DATE,
      estado: DataTypes.ENUM("pendiente", "confirmada", "cancelada"),
    },
    {
      sequelize,
      modelName: "ordenes",
    }
  );
  return Ordenes;
};
