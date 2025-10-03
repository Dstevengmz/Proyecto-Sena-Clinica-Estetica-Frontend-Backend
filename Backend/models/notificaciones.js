"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notificaciones extends Model {
    static associate(models) {
      Notificaciones.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });

      Notificaciones.belongsTo(models.citas, {
        foreignKey: "id_cita",
        as: "cita",
      });
    }
  }

  Notificaciones.init(
    {
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_cita: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM(
          "cita",
          "confirmacion_cita",
          "examenes",
          "sistema",
          "cita_reagendada",
          "cancelada",
          "eliminada"
        ),
        allowNull: false,
      },

      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      archivada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "notificaciones",
      tableName: "notificaciones",
    }
  );

  return Notificaciones;
};
