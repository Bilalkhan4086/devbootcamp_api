const express = require("express");
const {
  getCourses,
  updateCourse,
  getCourse,
  addCourse,
  deleteCourse,
} = require("../../controllers/v1/courses");
const advancedMiddleWare = require("../../middleware/advancedFilter");
const courses = require("../../models/courses");
const router = express.Router({ mergeParams: true });
const { protected, authorizedRoles } = require("../../middleware/auth");

router
  .route("/")
  .get(
    advancedMiddleWare(courses, [
      {
        path: "bootcamp",
        select: "name description",
      },
    ]),
    getCourses
  )
  .post(protected, authorizedRoles("admin", "publisher"), addCourse);
router
  .route("/:id")
  .put(protected, authorizedRoles("admin", "publisher"), updateCourse)
  .delete(protected, authorizedRoles("admin", "publisher"), deleteCourse)
  .get(getCourse);

module.exports = router;
