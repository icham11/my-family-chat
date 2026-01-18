const { User } = require("../models");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

const testRegister = async () => {
  try {
    const username = "testuser_" + Date.now();
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Attempting to register user: ${username}`);

    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    console.log("User registered successfully:", newUser.toJSON());
  } catch (error) {
    console.error("Registration failed:", error);
  } finally {
    await sequelize.close();
  }
};

testRegister();
