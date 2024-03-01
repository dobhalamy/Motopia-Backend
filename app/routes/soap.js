const express = require("express");
const router = express.Router();
const {
  getVersionInfo,
  describeVehicle,
  getCategoryDefinitions,
  getDivisions,
  getSubDivisions,
  getTechnicalSpecificationDefinitions,
  getModels,
  getModelYears,
  getStyles
} = require("../controllers/soap");

router.get("/version-info", getVersionInfo);
router.get("/category-defs", getCategoryDefinitions);
router.get("/tech-spec", getTechnicalSpecificationDefinitions);
router.post("/vin", describeVehicle);

//****************** Account 282682 without ADS - [Year Make Model Features] license. ******************//

router.get("/styles", getStyles); // Not availeble
router.get("/years", getModelYears); // Not availeble
router.get("/models", getModels); // Not availeble
router.get("/divisions", getDivisions); // Not availeble
router.get("/sub-divisions", getSubDivisions); // Not availeble

module.exports = router;
