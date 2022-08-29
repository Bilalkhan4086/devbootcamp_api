const asyncHandler = require("../../middleware/async");
const User = require("../../models/user");

// @decs Get All User
// @route GET /api/v1/users/
// @access Private
exports.getAllUser = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedMiddleWare);
});

// @decs Get Single User
// @route GET /api/v1/users/:id
// @access Private
exports.getSingleUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// @decs Create New User
// @route POST /api/v1/users/
// @access Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    user,
  });
});

// @decs Update Any User
// @route PUT /api/v1/users/:id
// @access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

// @decs Delete Any User
// @route DELETE /api/v1/users/:id
// @access Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});
