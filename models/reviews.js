const mongoose = require("mongoose");

const reviewShema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please Add the review title"],
    max: [100, "title cannot be more than 100 charaters"],
  },
  text: {
    type: String,
    required: [true, "Please Add the review description"],
  },
  rating: {
    type: Number,
    required: [true, "Please Add the ratings for the bootcamp"],
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

reviewShema.index({ bootcamp: 1, user: 1 }, { unique: true });

reviewShema.statics.getAverageRating = async function (bootcampId) {
  console.log("Calculation the average Rating...".blue);
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.log("err", err);
  }
};

reviewShema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

reviewShema.post("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Reviews", reviewShema);
