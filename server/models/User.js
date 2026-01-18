const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Chat, { foreignKey: "user_id" });
      User.hasMany(models.Reaction, { foreignKey: "user_id" });
      User.belongsToMany(models.Room, {
        through: models.RoomMember,
        foreignKey: "user_id",
      });
      User.hasMany(models.RoomMember, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      google_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable for OAuth users
      },
      bio: {
        type: DataTypes.TEXT,
      },
      avatar_url: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: false,
    },
  );
  return User;
};
