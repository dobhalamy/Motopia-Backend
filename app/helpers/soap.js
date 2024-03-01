const soap = require("node-wsdl");
const url = "http://services.chromedata.com:80/Description/7a?wsdl";
const config = require("../../config");
const BaseRequset = config.get("BaseRequest");

exports.getVersionInfo = () =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getVersionInfo(BaseRequset, function(
        err,
        result,
        rawResponse,
        soapHeader,
        rawRequest
      ) {
        if (err) {
          return reject(err);
        } else resolve(result);
      });
    });
  });

exports.describeVehicle = styleId =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.describeVehicle(
        {
          ...BaseRequset,
          styleId
        },
        function(err, result, rawResponse, soapHeader, rawRequest) {
          if (err) {
            return reject(err);
          } else resolve(result);
        }
      );
    });
  });

exports.getCategoryDefinitions = () =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getCategoryDefinitions(BaseRequset, function(
        err,
        result,
        rawResponse,
        soapHeader,
        rawRequest
      ) {
        if (err) {
          return reject(err);
        } else resolve(result);
      });
    });
  });

exports.getTechnicalSpecificationDefinitions = () =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getTechnicalSpecificationDefinitions(BaseRequset, function(
        err,
        result,
        rawResponse,
        soapHeader,
        rawRequest
      ) {
        if (err) {
          return reject(err);
        } else resolve(result);
      });
    });
  });

exports.getDivisions = modelYear =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getDivisions(
        { attributes: { modelYear }, ...BaseRequset },
        function(err, result, rawResponse, soapHeader, rawRequest) {
          if (err) {
            return reject(err);
          } else resolve(result);
        }
      );
    });
  });

exports.getSubdivisions = modelYear =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getSubdivisions(
        { attributes: { modelYear }, ...BaseRequset },
        function(err, result, rawResponse, soapHeader, rawRequest) {
          if (err) {
            return reject(err);
          } else resolve(result);
        }
      );
    });
  });

exports.getModels = (modelYear, subdivisionId) =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getModels({ ...BaseRequset, modelYear, subdivisionId }, function(
        err,
        result,
        rawResponse,
        soapHeader,
        rawRequest
      ) {
        if (err) {
          return reject(err);
        } else resolve(result);
      });
    });
  });

exports.getModelYears = () =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getModelYears(BaseRequset, function(
        err,
        result,
        rawResponse,
        soapHeader,
        rawRequest
      ) {
        if (err) {
          return reject(err);
        } else resolve(result);
      });
    });
  });

// ---------------TODO---------
exports.getStyles = modelId =>
  new Promise((resolve, reject) => {
    soap.createClient(url, async function(err, client) {
      client.getStyles({ attributes: { modelId }, ...BaseRequset }, function(
        err,
        result,
        rawResponse,
        soapHeader,
        rawRequest
      ) {
        if (err) {
          return reject(err);
        } else resolve(result);
      });
    });
  });
