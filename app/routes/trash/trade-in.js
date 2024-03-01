const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  tradeInList,
  tradeInUnreviewedList,
  createTradeIn,
  updateTradeIn,
  deleteTradeIn
} = require("../controllers/trade-in");

const firstLetterCap = require("../middlewares/firstletter-cap");

router.get("/", passport.authenticate("jwt", { session: false }), tradeInList);

router.get(
  "/primary",
  passport.authenticate("jwt", { session: false }),
  tradeInUnreviewedList
);

router.post("/", firstLetterCap, createTradeIn);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateTradeIn
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteTradeIn
);

module.exports = router;
