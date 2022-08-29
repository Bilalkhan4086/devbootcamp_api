const { Schema, model, Types } = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");
const bootcampSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the name"],
      trim: true,
      unique: true,
      maxlength: [50, "Name cannot be more than 50 charaters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add some description"],
      maxlength: [500, "Description cannot be more than 500 charaters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please Enter a valid url with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone cannot be longer than 20 Charaters"],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Enter the valid Email",
      ],
    },
    address: {
      type: String,
      required: [true, "You mus pass address"],
    },
    location: {
      // GEOJSON
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        index: "2dsphere",
      },
      formattedAddress: String,
      country: String,
      city: String,
      street: String,
      state: String,
      zipcode: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Others",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Number must be more than 1"],
      min: [10, "Number must be less than 10"],
    },
    averageCost: {
      default: 0,
      type: Number,
    },
    photo: {
      default: "no-photo.jpeg",
      type: String,
    },
    housing: {
      default: false,
      type: Boolean,
    },
    jobAssistance: {
      default: false,
      type: Boolean,
    },
    jobGuarantee: {
      default: false,
      type: Boolean,
    },
    acceptGi: {
      default: false,
      type: Boolean,
    },
    createdAt: {
      default: Date.now,
      type: Date,
    },
    user: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

bootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    country: loc[0].countryCode,
    city: loc[0].cityCode,
    street: loc[0].streetName,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
  };
  next();

  this.address = undefined;
});

// Deleting the courses before the specific bootcamp will delete

bootcampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});

// Defining virtuals

bootcampSchema.virtual("courses", {
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
  ref: "Course",
});

module.exports = model("Bootcamp", bootcampSchema);
