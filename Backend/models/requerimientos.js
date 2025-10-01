"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class requerimientos extends Model {
    static associate(models) {
      requerimientos.belongsTo(models.citas, {
        foreignKey: "id_cita",
        as: "cita",
      });
    }
  }
  requerimientos.init(
    {
      id_cita: DataTypes.INTEGER,
      descripcion: DataTypes.TEXT,
      frecuencia: DataTypes.INTEGER,
      repeticiones: DataTypes.INTEGER,
            //se modifico aqui
      fecha_inicio: DataTypes.DATEONLY,
      fecha_fin: DataTypes.DATE,
      estado: {
        type: DataTypes.ENUM(
        "pendiente",
        "realizada",
      ),
        defaultValue: "pendiente",
      },
    },
    {
      sequelize,
      modelName: "requerimientos",
    }
  );
  return requerimientos;
};
