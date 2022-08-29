const Bootcamp = require("../../models/Bootcamp");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const geocoder = require("../../utils/geocoder");
const path = require("path");
require("dotenv").config(__dirname);
// @decs Get All Bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedMiddleWare);
});

// @decs Get on Bootcamp with Id
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Resource with this Id Not Found`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @decs Update Bootcamp with Id
// @route PUT /api/v1/bootcamps/:id
// @access Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with this Id Not Found`, 404));
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`Only owner or admin can update the bootcamp`, 401)
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @decs Delete Bootcamp with Id
// @route DELETE /api/v1/bootcamps/:id
// @access Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Resource with this Id Not Found`, 404));
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`Only owner or admin can Delete the bootcamp`, 401)
    );
  }

  await bootcamp.remove();

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @decs Add Bootcamp
// @route POST /api/v1/bootcamps
// @access Public
exports.addBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const BootCampwithId = await Bootcamp.findOne({ user: req.user.id });
  if (BootCampwithId && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You cannot publish more than one Bootcamp with publisher role`,
        401
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @decs Get on Bootcamp By Radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Public
exports.getBootcampByRadius = asyncHandler(async (req, res, next) => {
  const { distance, zipcode } = req.params;
  const radius = distance / 3963.2;
  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude;
  const lat = loc[0].latitude;

  const bootcamp = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
    count: bootcamp.length,
  });
});

// @decs UPLOAD Bootcamp image
// @route PUT /api/v1/bootcamps/:id/photo
// @access Public
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Resource with this Id Not Found`, 400));
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Only owner or admin can upload the image of bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(
      new ErrorResponse(`No file uploaded please upload an image file`, 400)
    );
  }
  let file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Uploaded file is not an image file`, 400));
  }

  if (!file.size > process.env.IMAGE_SIZE) {
    return next(
      new ErrorResponse(
        `Uploaded image size should not be greater than ${
          process.env.IMAGE_SIZE / 10000
        } Mb`,
        400
      )
    );
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.UPLOAD_IMAGE_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log("err", err);
      return next(new ErrorResponse(`Error in Uploading file`, 500));
    }
  });

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, {
    photo: file.name,
  });

  res.status(201).json({
    success: true,
    data: file.name,
  });
});
