const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RoomMember extends Model {
    static associate(models) {
      RoomMember.belongsTo(models.User, { foreignKey: "user_id" });
      RoomMember.belongsTo(models.Room, { foreignKey: "room_id" });
    }
  }
  RoomMember.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "member", // admin, member
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      last_read_message_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "RoomMember",
      tableName: "room_members",
      timestamps: false,
    },
  );
  return RoomMember;
};
