const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    static associate(models) {
      Reaction.belongsTo(models.Chat, { foreignKey: "message_id" });
      Reaction.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  Reaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Reaction",
      tableName: "message_reactions",
      timestamps: false,
      updatedAt: false,
      createdAt: "created_at",
      indexes: [
        {
          unique: true,
          fields: ["message_id", "user_id", "type"],
        },
      ],
    },
  );
  return Reaction;
};
