const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { nextTick } = require("process");
require("dotenv").config(__dirname);
const UserShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add name"],
  },
  email: {
    type: String,
    required: [true, "please add email"],
    unique: [true, "Please add unique email address"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Enter the valid Email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minLength: 6,
    select: false,
  },
  resetpasswordToken: String,
  resetpasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Adding Middleware

UserShema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Initializing method for JWT sign and returning token

UserShema.methods.signJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECREAT, {
    expiresIn: process.env.TOKEN_EXPIREE,
  });
};

// Defining method for matching password
UserShema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Defining method for matching password
UserShema.methods.getResetToken = async function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetpasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetpasswordExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

module.exports = mongoose.model("user", UserShema);
