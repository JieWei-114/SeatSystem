import { DataTypes, Model } from 'sequelize';
import { SeatEntity } from '../entities/Seat';
import FloorPlan from './FloorPlans';

const sequelize = require('../../config/config').sequelize;

interface SeatInstance extends Model<SeatEntity>, SeatEntity {
  floorPlan?: import('./FloorPlans').default; // Add floorPlan association
}

class Seat extends Model<SeatEntity> implements SeatInstance {
  public id!: number;
  public floorPlanId!: number;
  public seatNumber!: string;
  public description?: string;
  public available!: boolean;
  public x!: number;
  public y!: number;
  public angle!: number;
  public scaleX!: number;
  public scaleY!: number;
  public width?: number;
  public height?: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public floorPlan?: import('./FloorPlans').default;
}

Seat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    floorPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'floorPlans', key: 'id' },
      onDelete: 'CASCADE',
    },
    seatNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    x: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    angle: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    scaleX: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },
    scaleY: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },
    width: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
    modelName: 'Seat',
    tableName: 'seats',
    timestamps: true,
  }
);

FloorPlan.hasMany(Seat, { foreignKey: 'floorPlanId', as: 'seats' });
Seat.belongsTo(FloorPlan, { foreignKey: 'floorPlanId', as: 'floorPlan' });

export default Seat;
