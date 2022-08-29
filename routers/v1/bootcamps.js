const express = require("express");
const {
  getBootcamps,
  updateBootcamp,
  getBootcamp,
  addBootcamp,
  deleteBootcamp,
  getBootcampByRadius,
  uploadBootcampPhoto,
} = require("../../controllers/v1/bootcamps");
const advancedMiddleWare = require("../../middleware/advancedFilter");
const Bootcamp = require("../../models/Bootcamp");
const courseRouter = require("./courses");
const reviewsRouter = require("./reviews");
const { protected, authorizedRoles } = require("../../middleware/auth");
const router = express.Router();
//  includung course route and merge it
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewsRouter);

router
  .route("/")
  .get(
    advancedMiddleWare(Bootcamp, [
      {
        path: "courses",
        select: "title",
      },
      {
        path: "user",
        select: "name",
      },
    ]),
    getBootcamps
  )
  .post(protected, authorizedRoles("admin", "publisher"), addBootcamp);
router
  .route("/:id")
  .put(protected, authorizedRoles("admin", "publisher"), updateBootcamp)
  .delete(protected, authorizedRoles("admin", "publisher"), deleteBootcamp)
  .get(getBootcamp);
router
  .route("/:id/photo")
  .put(protected, authorizedRoles("admin", "publisher"), uploadBootcampPhoto);

router.route("/radius/:zipcode/:distance").get(getBootcampByRadius);

module.exports = router;
