"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Consentimiento extends Model {
    static associate(models) {
      Consentimiento.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
      Consentimiento.belongsTo(models.citas, {
        foreignKey: "id_cita",
        as: "cita",
      });
    }
  }
  Consentimiento.init(
    {
      id_cita: DataTypes.INTEGER,
      id_usuario: DataTypes.INTEGER,
      fecha_firma: DataTypes.DATE,
      texto_terminos: DataTypes.TEXT,
      ruta_pdf: DataTypes.STRING,
      hash_pdf: DataTypes.STRING,
      ip_firma: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "consentimiento",
    }
  );
  return Consentimiento;
};
