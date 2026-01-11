const sequelize = require('../../config/config').sequelize;

import { DataTypes, Model } from 'sequelize';
import { BookingEntity } from '../entities/Booking';

import User from './Users';
import Seat from './Seats';

// Extend with associations
interface BookingInstance extends Model<BookingEntity>, BookingEntity {
  seat?: import('./Seats').default;
  user?: import('./Users').default;
}

class Booking extends Model<BookingEntity> implements BookingInstance {
  public id!: number;
  public userId!: number;
  public seatId!: number;
  public date!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public seat?: import('./Seats').default;
  public user?: import('./Users').default;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    seatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'seats', key: 'id' },
      onDelete: 'CASCADE',
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
  }
);


Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Seat, { foreignKey: 'seatId', as: 'seat' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Seat.hasMany(Booking, { foreignKey: 'seatId', as: 'bookings' });


export default Booking;