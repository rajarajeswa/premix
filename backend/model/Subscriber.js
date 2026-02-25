const { sequelize } = require('../db/db-connection');
const { DataTypes } = require('sequelize');

const Subscriber = sequelize.define('Subscriber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    subscribedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    unsubscribedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'subscribers',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports = { Subscriber };
