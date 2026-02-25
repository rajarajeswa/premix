const { DataTypes } = require('sequelize');
const sequelize = require('../db/db-connection');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'phone'
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reset_password_token'
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expires'
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = { User };
