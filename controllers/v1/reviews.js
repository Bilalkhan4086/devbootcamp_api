const asyncHandler = require("../../middleware/async");
const reviews = require("../../models/reviews");
const Bootcamp = require("../../models/Bootcamp");
const User = require("../../models/user");
const ErrorResponse = require("../../utils/errorResponse");

// @decs Get All User
// @route GET /api/v1/bootcamps/:BootcampId/reviews
// @route GET /api/v1/reviews/
// @access Private
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const review = await reviews.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: review.length,
      review,
    });
  }
  res.status(200).json(res.advancedMiddleWare);
});

// @decs Get Single User
// @route GET /api/v1/reviews/:id
// @access Private
exports.getReviewsForBootcamp = asyncHandler(async (req, res, next) => {
  const review = await reviews.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// @decs Create New User
// @route POST /api/v1/bootcamps/:bootcampId/reviews
// @access Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp the given id i.e. ${req.params.bootcampId} not found`,
        404
      )
    );
  }

  const review = await reviews.create(req.body);
  res.status(201).json({
    success: true,
    review,
  });
});

// @decs Update Any User
// @route PUT /api/v1/reviews/:id
// @access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await reviews.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No Review with this id`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update this review`, 401));
  }
  review = await reviews.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    review,
  });
});

// @decs Delete Any Review
// @route DELETE /api/v1/review/:id
// @access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await reviews.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No Review with this id`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to delete this review`, 401));
  }
  await reviews.remove();

  res.status(200).json({
    success: true,
    review,
  });
});
