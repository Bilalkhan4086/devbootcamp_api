const express = require("express");
const {
  getAllReviews,
  getReviewsForBootcamp,
  addReview,
  updateReview,
  deleteReview,
} = require("../../controllers/v1/reviews");
const advancedMiddleWare = require("../../middleware/advancedFilter");
const { protected, authorizedRoles } = require("../../middleware/auth");
const reviews = require("../../models/reviews");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(advancedMiddleWare(reviews), getAllReviews)
  .post(protected, authorizedRoles("admin", "user"), addReview);
router
  .route("/:id")
  .get(getReviewsForBootcamp)
  .put(protected, authorizedRoles("admin", "user"), updateReview)
  .delete(protected, authorizedRoles("admin", "user"), deleteReview);

module.exports = router;
