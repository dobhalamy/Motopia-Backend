const { XMLBuilder, XMLParser } = require('fast-xml-parser');
const XMLFileConfig = require('../models/web-360-xml-config');
const buildOptions = {
  format: true,
  ignoreAttributes: false,
  attributeNamePrefix : "@_",
};

exports.generateAndSaveXML = async ({ stockid, defaultPicture, degree20, degree45, degree60, make, model }) => {
  const imageList = [...degree20, ...degree45, ...degree60];
  const configTemplate = {
    root: {
      config: {
        settings: {
          preloader: {
              '@_image': '',
          },
          userInterface: {
            '@_viewerHint': `Tap to load 3d for ${make} ${model}`,
          }
        },
        hotspots: '',
        images: {
          image: []
        }
      }
    }
  };
  configTemplate.root.config.settings.preloader['@_image'] = defaultPicture;
  imageList.forEach(({ pic, lowRes }) => {
    configTemplate.root.config.images.image.push({
      highres: {
        '@_src': pic,
      },
      '@_src': lowRes,
    });
  });
  const existingConfig = await XMLFileConfig.find({ name: stockid });
  if (existingConfig.length) {
    return;
  }
  return new XMLFileConfig({ name: stockid, file: configTemplate }).save();
};

exports.get360Xml = async (stockid) => {
  const builder = new XMLBuilder(buildOptions);
  try {
    const vehicleConfig = await XMLFileConfig.findOne({ name: stockid }).lean();
    if (vehicleConfig && vehicleConfig.file) {
      const newXml = builder.build(vehicleConfig.file);
      return newXml;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
