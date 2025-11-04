'use strict';

module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID autoincremental de la solicitud'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Código de la solicitud'
    },
    descriptions: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Descripción de la solicitud'
    },
    resumen: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Resumen de la solicitud'
    },
    idEmployee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del empleado asociado a la solicitud',
      references: {
        model: 'employees',
        key: 'id'
      }
    }
  }, {
    tableName: 'requests',
    timestamps: true,
    underscored: true
  });

  return Request;
};
