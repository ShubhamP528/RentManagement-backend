const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");

exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      throw new Error("You are not authenticated!");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const user = await Owner.findById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
    return;
  }
};
