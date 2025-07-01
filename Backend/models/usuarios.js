"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {
    static associate(models) {
      Usuarios.hasOne(models.Historialclinico, {
        foreignKey: "id_usuario",
        as: "historial_medico",
      });
      Usuarios.hasMany(models.Citas, {
        foreignKey: "id_usuario",
        as: "citas_paciente",
      });
      Usuarios.hasMany(models.Citas, {
        foreignKey: "id_doctor",
        as: "citas_doctor",
      });
      Usuarios.hasMany(models.Procedimientos, {
        foreignKey: "id_usuario",
        as: "Procedimientos",
      });
      Usuarios.hasMany(models.Ordenes, {
        foreignKey: "id_usuario",
        as: "ordenes",
      });
    }
  }
  Usuarios.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipodocumento: {
        type: DataTypes.ENUM(
          "Cédula de Ciudadanía",
          "Pasaporte",
          "Documento de Identificación Extranjero",
          "Permiso Especial de Permanencia"
        ),
        allowNull: false,
      },
      numerodocumento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      contrasena: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM("doctor", "usuario", "asistente"),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.BIGINT,
      },
      direccion: {
        type: DataTypes.STRING,
      },
      fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      genero: {
        type: DataTypes.STRING,
      },
      fecha_nacimiento: {
        type: DataTypes.DATE,
      },
      ocupacion: {
        type: DataTypes.STRING,
      },
      estado_civil: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Usuarios",
      timestamps: true,
    }
  );
  return Usuarios;
};
