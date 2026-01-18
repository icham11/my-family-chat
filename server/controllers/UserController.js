const { User } = require("../models");
const { Op } = require("sequelize");

const UserController = {
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      if (!q) return res.json([]);

      const users = await User.findAll({
        where: {
          username: {
            [Op.iLike]: `%${q}%`,
          },
          id: { [Op.ne]: req.user.id }, // Exclude self
        },
        attributes: ["id", "username", "avatar_url"],
        limit: 10,
      });
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = UserController;
