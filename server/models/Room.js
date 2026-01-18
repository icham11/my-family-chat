const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.hasMany(models.Chat, { foreignKey: "room_id" });
      Room.belongsToMany(models.User, {
        through: models.RoomMember,
        foreignKey: "room_id",
      });
      Room.hasMany(models.RoomMember, { foreignKey: "room_id" });
    }
  }
  Room.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable for DMs (we'll display other user's name)
      },
      type: {
        type: DataTypes.ENUM("group", "direct"),
        defaultValue: "group",
      },
      description: {
        type: DataTypes.STRING,
      },
      avatar_url: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Room",
      tableName: "rooms",
      timestamps: false,
    },
  );
  return Room;
};
