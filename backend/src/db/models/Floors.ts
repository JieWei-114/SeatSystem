import { DataTypes, Model } from 'sequelize';
import { FloorEntity } from '../entities/Floor';
import Building from './Buildings';

const sequelize = require('../../config/config').sequelize;

class Floor extends Model<FloorEntity> implements FloorEntity {
    public id!: number;
    public buildingId!: number;
    public name!: string;
    public description!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // Association property
    public building?: import('./Buildings').default;
}

Floor.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        buildingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'buildings', key: 'id' },
            onDelete: 'CASCADE',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
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
        modelName: 'Floor',
        tableName: 'floors',
        timestamps: true,
    }
);

// Building.hasMany(Floor, { foreignKey: 'buildingId' });
// Floor.belongsTo(Building, { foreignKey: 'buildingId' });

Floor.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' });
Building.hasMany(Floor, { foreignKey: 'buildingId', as: 'floors' }); // BUIDING WILL NOT WOKRING

export default Floor;