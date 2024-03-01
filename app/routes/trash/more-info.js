const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  moreInfoList,
  moreInfoUnreviewedList,
  createMoreInfo,
  updateMoreInfo,
  deleteMoreInfo
} = require("../controllers/more-info");

const firstLetterCap = require("../middlewares/firstletter-cap");

router.get("/", passport.authenticate("jwt", { session: false }), moreInfoList);

router.get(
  "/primary",
  passport.authenticate("jwt", { session: false }),
  moreInfoUnreviewedList
);

router.post("/", firstLetterCap, createMoreInfo);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateMoreInfo
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteMoreInfo
);

module.exports = router;
