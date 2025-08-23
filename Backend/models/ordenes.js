"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ordenes extends Model {
    static associate(models) {
      Ordenes.belongsTo(models.Usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Ordenes.belongsToMany(models.Procedimientos, {
        through: "ordenprocedimientos",
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
      modelName: "Ordenes",
    }
  );
  return Ordenes;
};
