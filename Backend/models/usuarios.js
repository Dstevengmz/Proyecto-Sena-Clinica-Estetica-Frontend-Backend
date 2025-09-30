"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {
    static associate(models) {
      Usuarios.hasOne(models.historialclinico, {
        foreignKey: "id_usuario",
        as: "historial_medico",
      });
      Usuarios.hasMany(models.citas, {
        foreignKey: "id_usuario",
        as: "citas_paciente",
      });
      Usuarios.hasMany(models.citas, {
        foreignKey: "id_doctor",
        as: "citas_doctor",
      });
      Usuarios.hasMany(models.procedimientos, {
        foreignKey: "id_usuario",
        as: "Procedimientos",
      });
      Usuarios.hasMany(models.ordenes, {
        foreignKey: "id_usuario",
        as: "ordenes",
      });
      Usuarios.hasMany(models.carrito, {
        foreignKey: "id_usuario",
        as: "carritos",
      });
      Usuarios.hasMany(models.consentimiento, {
        foreignKey: "id_usuario",
        as: "consentimientos",
      });
      Usuarios.hasMany(models.notificaciones, {
        foreignKey: "id_usuario",
        as: "notificaciones",
      });
    }
  }
  Usuarios.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
        type: DataTypes.STRING,
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
        terminos_condiciones: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
    },
    {
      sequelize,
      modelName: "usuarios",
      timestamps: true,
    }
  );
  return Usuarios;
};
