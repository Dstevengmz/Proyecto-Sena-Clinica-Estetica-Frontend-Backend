"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Citas extends Model {
    static associate(models) {
      Citas.belongsTo(models.Usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Citas.belongsTo(models.Usuarios, {
        foreignKey: "id_doctor",
        as: "doctor",
      });
      Citas.belongsTo(models.Ordenes, {
        foreignKey: "id_orden",
        as: "orden",
      });
    }
  }
  Citas.init(
    {
      id_orden: DataTypes.INTEGER,
      id_usuario: DataTypes.INTEGER,
      id_doctor: DataTypes.INTEGER,
      fecha: DataTypes.DATE,
      estado: DataTypes.ENUM(
        "pendiente",
        "confirmada",
        "realizada",
        "cancelada"
      ),
      tipo: DataTypes.ENUM("evaluacion", "procedimiento"),
      observaciones: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "citas",
    }
  );
  return Citas;
};
