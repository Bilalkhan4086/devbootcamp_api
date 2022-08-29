const Courses = require("../../models/courses");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const courses = require("../../models/courses");
const Bootcamp = require("../../models/Bootcamp");

// @decs Get All Courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const course = await Courses.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: course.length,
      data: course,
    });
  } else {
    res.status(200).json(res.advancedMiddleWare);
  }
});

// @decs Get Course with Id
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Courses.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(new ErrorResponse(`Resource with this Id Not Found`, 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @decs Update Course with Id
// @route PUT /api/v1/courses/:id
// @access Public
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Courses.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Resource with this Id Not Found`, 404));
  }

  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Only owner or admin can update course for the bootcamp`,
        401
      )
    );
  }

  course = await Courses.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @decs Delete Course with Id
// @route DELETE /api/v1/courses/:id
// @access Public
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Courses.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Resource with this Id Not Found`, 404));
  }

  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Only owner or admin can delete course for the bootcamp`,
        401
      )
    );
  }
  await course.remove();

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @decs Add Course
// @route POST /api/v1/:bootcampId/courses
// @access Public
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with ${req.params.bootcampId} Id Not Found`,
        404
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Only owner or admin can create course for the bootcamp`,
        401
      )
    );
  }

  const course = await Courses.create(req.body);
  res.status(201).json({
    success: true,
    data: course,
  });
});
