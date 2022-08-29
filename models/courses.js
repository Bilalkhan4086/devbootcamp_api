const mongoose = require("mongoose");

const courseShema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please Add the course title"],
  },
  description: {
    type: String,
    required: [true, "Please Add the course description"],
  },
  weeks: {
    type: Number,
    required: [true, "Please Add the number of weeks"],
  },
  tuition: {
    type: Number,
    trim: true,
    required: [true, "Please Add the tution cost"],
  },
  minimumSkill: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: [true, "Please Add the minimum Skills"],
  },
  scholarshipsAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Types.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

courseShema.statics.getAverage = async function (bootcampId) {
  console.log("Calculation the average...".blue);
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.log("err", err);
  }
};

courseShema.post("save", function () {
  this.constructor.getAverage(this.bootcamp);
});

courseShema.post("remove", function () {
  this.constructor.getAverage(this.bootcamp);
});

module.exports = mongoose.model("Course", courseShema);
