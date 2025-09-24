"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Citas extends Model {
    static associate(models) {
      Citas.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Citas.belongsTo(models.usuarios, {
        foreignKey: "id_doctor",
        as: "doctor",
      });
      Citas.belongsTo(models.ordenes, {
        foreignKey: "id_orden",
        as: "orden",
      });
      Citas.hasMany(models.examen, {
        foreignKey: "id_cita",
        as: "examenes",
      });
      Citas.hasMany(models.consentimiento, {
        foreignKey: "id_cita",
        as: "consentimientos",
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
      examenes_requeridos: DataTypes.TEXT,
      nota_evolucion: DataTypes.TEXT,
      examenes_cargados: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "citas",
    }
  );
  return Citas;
};
