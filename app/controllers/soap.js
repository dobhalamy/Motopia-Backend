const {
  getVersionInfo,
  getCategoryDefinitions,
  getDivisions,
  getModelYears,
  getModels,
  getStyles,
  getSubdivisions,
  getTechnicalSpecificationDefinitions,
  describeVehicle
} = require("../helpers/soap");

exports.getVersionInfo = async (req, res, next) => {
  try {
    const result = await getVersionInfo();
    res.json(result.data);
  } catch (error) {
    next(error);
  }
};

exports.describeVehicle = async (req, res, next) => {
  try {
    const { styleId } = req.body;
    const result = await describeVehicle(styleId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryDefinitions = async (req, res, next) => {
  try {
    const result = await getCategoryDefinitions();
    res.json(result.category);
  } catch (error) {
    next(error);
  }
};

exports.getDivisions = async (req, res, next) => {
  try {
    const modelYear = 2011;
    const result = await getDivisions(modelYear);
    res.set("Content-Type", "text/xml;charset=UTF-8");
    res.send(result);
  } catch (error) {
    next(error);
  }
};

exports.getSubDivisions = async (req, res, next) => {
  try {
    const modelYear = 2011;
    const result = await getSubdivisions(modelYear);
    res.set("Content-Type", "text/xml;charset=UTF-8");
    res.send(result);
  } catch (error) {
    next(error);
  }
};

exports.getTechnicalSpecificationDefinitions = async (req, res, next) => {
  try {
    const result = await getTechnicalSpecificationDefinitions();
    res.json(result.definition);
  } catch (error) {
    next(error);
  }
};

exports.getModels = async (req, res, next) => {
  try {
    const modelYear = 2011;
    const subdivisionId = 6938;
    const result = await getModels(modelYear, subdivisionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getModelYears = async (req, res, next) => {
  try {
    const result = await getModelYears();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getStyles = async (req, res, next) => {
  try {
    const modelId = 1;
    const result = await getStyles(modelId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
