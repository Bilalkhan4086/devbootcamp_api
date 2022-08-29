const express = require("express");
const {
  getAllUser,
  updateUser,
  deleteUser,
  getSingleUser,
  createUser,
} = require("../../controllers/v1/users");
const advancedMiddleWare = require("../../middleware/advancedFilter");
const { authorizedRoles, protected } = require("../../middleware/auth");
const user = require("../../models/user");

const router = express.Router();
router.use(protected);
router.use(authorizedRoles("admin"));

router.route("/:id").put(updateUser).delete(deleteUser).get(getSingleUser);
router
  .route("/")
  .get(advancedMiddleWare(user, []), getAllUser)
  .post(createUser);

module.exports = router;
