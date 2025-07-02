"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Procedimientos extends Model {
    static associate(models) {
      Procedimientos.belongsTo(models.Usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Procedimientos.belongsToMany(models.Ordenes, {
        through: "orden_procedimientos",
        foreignKey: "id_procedimiento",
        otherKey: "id_orden",
        as: "ordenes",
      });
      Procedimientos.hasMany(models.Carrito, {
      foreignKey: "id_procedimiento",
      as: "carritos"
    });
    }
  }
  Procedimientos.init(
    {
      nombre: DataTypes.STRING,
      descripcion: DataTypes.TEXT,
      precio: DataTypes.FLOAT,
      requiere_evaluacion: DataTypes.BOOLEAN,
      duracion: DataTypes.STRING,
      examenes_requeridos: DataTypes.TEXT,
      imagen: DataTypes.STRING,
      categoria: DataTypes.STRING,
      recomendaciones_previas: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Procedimientos",
    }
  );
  return Procedimientos;
};
