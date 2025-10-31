import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Classification = sequelize.define('Classification', {
  emailText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  classification: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  suggestedResponse: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default Classification;
