import { Model, DataTypes, Sequelize } from 'sequelize';
import Floor from './Floors';
import { FloorPlanEntity } from '../entities/FloorPlan';
import { FloorEntity } from '../entities/Floor';

const sequelize = require('../../config/config').sequelize;

class FloorPlan extends Model<FloorPlanEntity> implements FloorPlanEntity {
    public id!: number;
    public floorId!: number;
    public imagePath!: string;
    public createdAt?: Date;
    public updatedAt?: Date;

    public floor?: FloorEntity;
}

FloorPlan.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        floorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        imagePath: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    {
        sequelize,
        modelName: 'FloorPlan',
        tableName: 'floorPlans'
    }
);

Floor.hasOne(FloorPlan, { foreignKey: 'floorId', as: 'floorPlan' });
FloorPlan.belongsTo(Floor, { foreignKey: 'floorId', as: 'floor' });

export default FloorPlan;