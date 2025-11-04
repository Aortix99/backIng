'use strict';

module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID autoincremental del empleado'
    },
    dateAdmission: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: 'Fecha de ingreso del empleado'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nombre del empleado'
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Salario del empleado'
    }
  }, {
    tableName: 'employees',
    timestamps: true,
    underscored: true
  });

  return Employee;
};
