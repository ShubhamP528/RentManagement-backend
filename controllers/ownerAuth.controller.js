const Owner = require("../models/Owner");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (owner) => {
  const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });
  return token;
};

const verifyUser = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];

    res.json({
      message: "Logged in successfully",
      token: token,
      username: req.user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existOwner = await Owner.findOne({ username: username });
    if (!existOwner) {
      throw new Error("user not found");
    }
    if (!(await bcrypt.compare(password, existOwner.password))) {
      throw new Error("Invalid credentials");
    }
    const token = createToken(existOwner);
    res.json({ message: "Logged in successfully", token: token, username });
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: "Invalid credentials" });
  }
};

const signup = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existOwner = await Owner.findOne({ username: username });
    if (existOwner) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (!validator.isStrongPassword(password)) {
      throw Error("Password is not enough strong");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOwner = new Owner({ username, password: hashedPassword });
    await newOwner.save();
    const token = createToken(newOwner);
    res
      .status(201)
      .json({ message: "User created successfully", token: token, username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  signup,
  verifyUser,
};
