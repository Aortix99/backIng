'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID autoincremental del usuario'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nombre del usuario'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Correo electrónico del usuario'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Contraseña del usuario'
    },
    role: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Rol del usuario (false: Empleado, true: Admin)'
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: true,
      comment: 'Celular: 10 dígitos, inicia con 3'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: 'Fecha de creación del usuario'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: 'Fecha de actualización del usuario'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  return User;
};
