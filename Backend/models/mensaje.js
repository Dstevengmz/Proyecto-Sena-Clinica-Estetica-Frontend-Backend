"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mensaje extends Model {
    static associate(models) {
      Mensaje.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Mensaje.belongsTo(models.usuarios, {
        foreignKey: "id_asistente",
        as: "asistente",
      });
      Mensaje.belongsTo(models.citas, {
        foreignKey: "id_cita",
        as: "cita",
      });
    }
  }
  Mensaje.init(
    {
      id_usuario: DataTypes.INTEGER,
      id_asistente: DataTypes.INTEGER,
      id_cita: DataTypes.INTEGER,
      remitente: DataTypes.ENUM("usuario", "asistente"),
      texto: DataTypes.TEXT,
      fecha_envio: DataTypes.DATE,
      leido: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "mensaje",
    }
  );
  return Mensaje;
};
