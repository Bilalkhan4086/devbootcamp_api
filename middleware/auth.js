const ResponseError = require("../utils/errorResponse");
const asyncHandler = require("./async");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protected = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new ResponseError("Not Allowed to access this route without login", 401)
    );
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECREAT);
    req.user = await User.findById(id);
    next();
  } catch (err) {
    return next(new ResponseError("Unauthorized user", 401));
  }
});

exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ResponseError(
          `Not Allowed to access this route with ${req.user.role} role`,
          403
        )
      );
    }
    next();
  };
};
