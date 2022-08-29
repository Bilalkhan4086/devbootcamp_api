const fs = require("fs");
const dotenv = require("dotenv");
const colors = require("colors");
const mongoose = require("mongoose");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/courses");
const Reviews = require("../models/reviews");
const User = require("../models/user");

dotenv.config(__dirname);
const connect = async () => {
  console.log("its running");
  await mongoose.connect(process.env.MONGO_URI);
};

// Reading Json Files
const bootcampfile = JSON.parse(
  fs.readFileSync("./_data/bootcamps.json"),
  "uft-8"
);
const coursefile = JSON.parse(fs.readFileSync("./_data/courses.json"), "uft-8");
const userfile = JSON.parse(fs.readFileSync("./_data/users.json"), "uft-8");
const reviewfile = JSON.parse(fs.readFileSync("./_data/reviews.json"), "uft-8");
// Import the Data
const importData = async () => {
  try {
    await connect();
    await Bootcamp.create(bootcampfile);
    await Course.create(coursefile);
    await User.create(userfile);
    await Reviews.create(reviewfile);
    console.log(`data imported`.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete the data

const DeleteData = async () => {
  try {
    await connect();
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Reviews.deleteMany();
    console.log(`data Deleted`.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  DeleteData();
}
