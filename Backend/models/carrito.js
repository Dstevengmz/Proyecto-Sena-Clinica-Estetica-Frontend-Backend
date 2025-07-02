"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Carrito extends Model {
    static associate(models) {
      Carrito.belongsTo(models.Usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Carrito.belongsTo(models.Procedimientos, {
        foreignKey: "id_procedimiento",
        as: "procedimiento",
      });
    }
  }
  Carrito.init(
    {
      id_usuario: DataTypes.INTEGER,
      id_procedimiento: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Carrito",
    }
  );
  return Carrito;
};
