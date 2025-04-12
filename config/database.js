const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("Database connected successfully!!");
    })
    .catch((error) => {
      console.error(error);
    });
};
