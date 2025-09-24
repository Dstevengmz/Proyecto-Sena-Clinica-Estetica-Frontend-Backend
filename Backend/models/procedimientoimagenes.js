"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class procedimientoimagenes extends Model {
    static associate(models) {
      procedimientoimagenes.belongsTo(models.procedimientos, {
        foreignKey: "procedimientoId",
        as: "procedimiento",
        onDelete: "CASCADE",
      });
    }
  }

  procedimientoimagenes.init(
    {
      url: DataTypes.STRING,
      alt: DataTypes.STRING,
      orden: DataTypes.INTEGER,
      procedimientoId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "procedimientoimagenes",
    }
  );

  return procedimientoimagenes;
};
