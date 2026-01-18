const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsTo(models.User, { foreignKey: "user_id" });
      Chat.belongsTo(models.Room, { foreignKey: "room_id" });
      Chat.hasMany(models.Reaction, {
        foreignKey: "message_id",
        as: "reactions",
      });
      Chat.belongsTo(models.Chat, { as: "ReplyTo", foreignKey: "reply_to_id" });
    }
  }
  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "text",
      },
      attachment_url: {
        type: DataTypes.STRING,
      },
      latitude: {
        type: DataTypes.FLOAT,
      },
      longitude: {
        type: DataTypes.FLOAT,
      },
      reply_to_id: {
        type: DataTypes.INTEGER,
      },
      is_forwarded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      room_id: {
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
      modelName: "Chat",
      tableName: "chats",
      timestamps: false,
      updatedAt: false,
      createdAt: "created_at",
    },
  );
  return Chat;
};
