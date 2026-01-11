import { DataTypes, Model, Sequelize } from 'sequelize';
import { UserEntity } from '../entities/User';

// Import sequelize from config.js
const sequelize = require('../../config/config').sequelize;

class Users extends Model<UserEntity> implements UserEntity {
  public id?: number;
  public username!: string;
  public password!: string;
  public role!: 'super_admin' | 'facility_manager' | 'normal_user';
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue('username', value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'facility_manager', 'normal_user'),
      allowNull: false,
      defaultValue: 'normal_user',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default Users;