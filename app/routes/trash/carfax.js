const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  carfaxList,
  carfaxUnreviewedList,
  createCarFax,
  updateCarFax,
  deleteCarFax
} = require("../../controllers/trash/carfax");

const firstLetterCap = require("../../middlewares/firstletter-cap");

router.get("/", passport.authenticate("jwt", { session: false }), carfaxList);

router.get(
  "/primary",
  passport.authenticate("jwt", { session: false }),
  carfaxUnreviewedList
);

router.post("/", firstLetterCap, createCarFax);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateCarFax
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteCarFax
);

module.exports = router;
