import { DataTypes, Model, Sequelize } from 'sequelize';
import { BuildingEntity } from '../entities/Building';

const sequelize = require('../../config/config').sequelize;

class Building extends Model<BuildingEntity> implements BuildingEntity {
    public id!: number;
    public name!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Building.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
        modelName: 'Building',
        tableName: 'buildings',
        timestamps: true,
    }
);

export default Building;