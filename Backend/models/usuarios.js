'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model 
  {
    static associate(models) {
    }
  }
  Usuarios.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    contrasena: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('doctor', 'usuario', 'asistente'),
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
      allowNull: false
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
  }
}, {
    sequelize,
    modelName: 'Usuarios',
    timestamps: true,
  });
  return Usuarios;
};