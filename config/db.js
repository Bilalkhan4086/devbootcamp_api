const mongoose = require("mongoose");
require("dotenv").config("../.env");

const connectionDB = () => {
  console.log("pas =", process.env.MONGO_URI);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log(`MongoDB connection`);
    })
    .catch((e) => {
      console.log("error in Mongodb connection", e);
    });
};
module.exports = connectionDB;
