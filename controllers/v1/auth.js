const User = require("../../models/user");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const sendMail = require("../../utils/sendEmail");
const crypto = require("crypto");
const user = require("../../models/user");
require("dotenv").config(__dirname);

const sendCookieResponse = (user, res, statusCode) => {
  const token = user.signJWTToken();
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIREE * 1000 * 60 * 60),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @decs Register New User
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendCookieResponse(user, res, 200);
});

// @decs Login existing User
// @route POST /api/v1/auth/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorResponse("Email or Password provided is invalid", 401)
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(
      new ErrorResponse("Email or Password provided is invalid", 401)
    );
  }

  sendCookieResponse(user, res, 200);
});

// @decs Returning the users information
// @route GET /api/v1/auth/me
// @access Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// @decs send email and url for forget password
// @route GET /api/v1/auth/forgetpassword
// @access Public

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new ErrorResponse(`User with this email not found`, 404));
  }

  const resetToken = await user.getResetToken();
  console.log("resetToken", resetToken);
  await user.save({ validateBeforeSave: false });

  try {
    await sendMail({
      email: user.email,
      subject: "Reset your password",
      message: `This mail is sent to you to reset you password and reset it follow the link its expire at ${Date()} from now.
      \n\n 
      ${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/resetpassword/${resetToken}
      `,
    });
  } catch (error) {
    user.resetpasswordExpires = undefined;
    user.resetpasswordToken = undefined;

    await user.save({ validateBeforeSave: false });
    next(new ErrorResponse("Email couldnot be sent", 500));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @decs Reset the password of the user by navigating the url send in mail
// @route POST /api/v1/auth/resetpassword/:token
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetpasswordExpires: { $gt: Date.now() },
    resetpasswordToken: tokenHash,
  });
  if (!user) {
    return next(
      new ErrorResponse("Invalid token or token this url is expired")
    );
  }
  console.log("req.params.password", req.body.password);
  user.password = req.body.password;
  user.resetpasswordExpires = undefined;
  user.resetpasswordToken = undefined;
  await user.save();
  sendCookieResponse(user, res, 200);
});

// @decs Update User Details
// @route PUT /api/v1/auth/setme
// @access Private

exports.setMe = asyncHandler(async (req, res, next) => {
  const update = {
    email: req.body.email,
    name: req.body.name,
  };
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...update,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return next(new ErrorResponse("Internal Server Error", 500));
  }
});

// @decs Update User Password
// @route PUT /api/v1/auth/setpassword
// @access Private

exports.setPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse("password is not correct", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendCookieResponse(user, res, 200);
  } catch (err) {
    return next(new ErrorResponse("Internal Server Error", 500));
  }
});

// @decs Loging out the user and clearing cache
// @route GET /api/v1/auth/logout
// @access Private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
  });
});
