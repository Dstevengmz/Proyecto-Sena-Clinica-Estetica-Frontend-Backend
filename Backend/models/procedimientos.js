"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Procedimientos extends Model {
    static associate(models) {
      Procedimientos.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Procedimientos.belongsToMany(models.ordenes, {
        through: "ordenprocedimientos",
        foreignKey: "id_procedimiento",
        otherKey: "id_orden",
        as: "ordenes",
      });
      Procedimientos.hasMany(models.carrito, {
        foreignKey: "id_procedimiento",
        as: "carritos",
      });
      Procedimientos.belongsTo(models.categoriaprocedimientos, {
        foreignKey: "categoriaId",
        as: "categoria",
      });
      Procedimientos.hasMany(models.procedimientoimagenes, {
        foreignKey: "procedimientoId",
        as: "imagenes",
        onDelete: "CASCADE",
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
      categoriaId: DataTypes.INTEGER,
      recomendaciones_previas: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "procedimientos",
    }
  );
  return Procedimientos;
};
