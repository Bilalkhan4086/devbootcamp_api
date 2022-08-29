const express = require("express");
const {
  register,
  login,
  getMe,
  forgetPassword,
  resetPassword,
  setMe,
  setPassword,
  logout,
} = require("../../controllers/v1/auth");
const { protected } = require("../../middleware/auth");

const router = express.Router();

router.route("/register/").post(register);
router.route("/login/").post(login);
router.route("/logout/").get(logout);
router.route("/me").get(protected, getMe);
router.route("/forgetpassword").get(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/setme").put(protected, setMe);
router.route("/setpassword").put(protected, setPassword);

module.exports = router;
