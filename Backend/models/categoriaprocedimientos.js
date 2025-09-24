"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class categoriaprocedimientos extends Model {
    static associate(models) {
      categoriaprocedimientos.hasMany(models.procedimientos, {
        foreignKey: "categoriaId",
        as: "procedimientos",
      });
    }
  }
  categoriaprocedimientos.init(
    {
      nombre: DataTypes.STRING,
      descripcion: DataTypes.STRING,
      estado: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "categoriaprocedimientos",
    }
  );
  return categoriaprocedimientos;
};
