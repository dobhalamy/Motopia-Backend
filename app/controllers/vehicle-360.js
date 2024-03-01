const Vehicle360 = require('../models/vehicle-360');
const XMLFileConfig = require('../models/web-360-xml-config');
const { get360Xml } = require('../helpers/generateXML');
const { InternalServerError } = require("../helpers/api_error");

exports.getVehicle360List = async (req, res) => {
  try {
    const vehicles360 = await Vehicle360.find().lean();
    res.json({
      status: "success",
      data: vehicles360,
    });
  } catch (error) {
    res.send(error.message || error);
  }
};

exports.getVehicle360 = async (req, res) => {
  const { stockid } = req.params
  try {
    const vehicle360 = await Vehicle360.findOne({ stockid }).lean();
    res.json({
      status: "success",
      data: vehicle360,
    });
  } catch (error) {
    next(new InternalServerError(error));
  }
};

exports.getXMLFileForStockId = async (req, res, next) => {
  const { stockid } = req.params;
  try {
    const xml = await get360Xml(stockid);
    res.setHeader('Content-type', 'text/xml');
    res.send(xml);
  } catch (error) {
    next(new InternalServerError(error));
  }

}

exports.updateHotSpots = async (req, res, next) => {
  const { stockid, exteriorHotspots, interiorHotspots } = req.body;
  const getCurrentImageIndexes = (rowMap, imageIndex) => {
    const { firstImageIndex, edgeCaseImageIndexMap } = rowMap;
    const currentIndex = imageIndex + firstImageIndex;
    if (!edgeCaseImageIndexMap.has(imageIndex)) {
      return [currentIndex - 2, currentIndex - 1, currentIndex, currentIndex + 1, currentIndex + 2]
    }
    return edgeCaseImageIndexMap.get(imageIndex);

  }
  const rowIndexMap = {
    0: {
      firstImageIndex: 0,
      lastImageIndex: 71,
      edgeCaseImageIndexMap: new Map([
        [70, [68, 69, 70, 71, 0]],
        [71, [69, 70, 71, 0, 1]],
        [0, [70, 71, 0, 1, 2]],
        [1, [71, 0, 1, 2, 3]]
      ]),
    },
    1: {
      firstImageIndex: 72,
      lastImageIndex: 143,
      edgeCaseImageIndexMap: new Map([
        [70, [140, 141, 142, 143, 72]],
        [71, [141, 142, 143, 72, 73]],
        [0, [142, 143, 72, 73, 74]],
        [1, [143, 72, 73, 74, 75]],
      ]),
    },
    2: {
      firstImageIndex: 144,
      lastImageIndex: 215,
      edgeCaseImageIndexMap: new Map([
        [70, [212, 213, 214, 215, 144]],
        [71, [213, 214, 215, 144, 145]],
        [0, [214, 215, 144, 145, 146]],
        [1, [215, 144, 145, 146, 147]]
      ]),
    },
  };

  const hotSpotsUpdate = {};
  try {
    const existingVehicle360 = await Vehicle360.findOne({ stockid }).lean();
    if (exteriorHotspots && exteriorHotspots.length) {
      const existingConfig = await XMLFileConfig.findOne({ name: stockid }).lean();
      const newHotspotsForConfig = exteriorHotspots.map(hotspot => {
        const { rowIndex, imageIndex } = hotspot;
        const imageIndexList = getCurrentImageIndexes(rowIndexMap[rowIndex], imageIndex);
        return {
          ...hotspot,
          imageIndexList,
        }
      });
      hotSpotsUpdate.exteriorHotspots = [...existingVehicle360.exteriorHotspots, ...newHotspotsForConfig];

      const update = {
        hotspots: {
          hotspot: exteriorHotspots.map(pin => {
            const { id, type, title, description } = pin;
            const descriptionArr = description.split(',');
            let parsedDescription = `<p style="margin: 0.5rem 0;">${description.replace(/&/g, '&amp;')}</p>`;
            if (descriptionArr.length > 1) {
              parsedDescription = `
                <ul style="margin: 0.5rem 0;">
                  ${descriptionArr.map(desc => {
                const text = desc.trim();
                if (text.length === 0) {
                  return;
                }
                return '<li>' + text.replace(/&/g, '&amp;') + '</li>';
              }).join('')}
                </ul>
              `;
            }
  
            return {
              '@_id': id,
              '@_indicatorImage': type === 'DAMAGE' ? 'circ-cross-thin-red.svg' : 'circ-cross-thin-orange.svg',
              spotinfo: {
                cdata: pin.picture ? `
                  <h4 style="margin: 0;">${title}</h4>
                  ${pin.picture && '<img src="' + pin.picture + '" width=240/>'}
                  ${parsedDescription}
                ` : `
                  <h4 style="margin: 0;">${title}</h4>
                  ${parsedDescription}
                `,
              }
            };
          }),
        },
        images: {
          ...existingConfig.file.root.config.images,
          image: [],
        }
      };
      const newImages = [...existingConfig.file.root.config.images.image];
  
      newHotspotsForConfig.forEach(({ id, imageIndex, rowIndex, offsetX, offsetY, title, imageIndexList }, index) => {
        let x = offsetX * 3.2;
        const y = (offsetY * 3.1);
        const isSamePictureHotspots = exteriorHotspots[index + 1]
          ? rowIndex === exteriorHotspots[index + 1].rowIndex && imageIndex === exteriorHotspots[index + 1].imageIndex
          : false;
        imageIndexList.forEach(i => {
          newImages[i] = {
            ...newImages[i],
            hotspot: [
              ...newImages[i].hotspot,
              {
                '@_source': id,
                '@_offsetX': x,
                '@_offsetY': y,
              }
            ]
          };
          x = x - 20;
        });
        if (!newImages[imageIndexList[0]]['@_label']) {
          newImages[imageIndexList[0]]['@_label'] = title;
        }
        if (isSamePictureHotspots && newImages[imageIndexList[0]]['@_label']) {
          newImages[imageIndexList[4]]['@_label'] = exteriorHotspots[index + 1].title;
        }
      });
      update.images.image = newImages;
  
      await XMLFileConfig.findOneAndUpdate({ name: stockid }, {
        ...existingConfig,
        file: {
          ...existingConfig.file,
          root: {
            ...existingConfig.file.root,
            config: {
              ...existingConfig.file.root.config,
              hotspots: {
                ...existingConfig.file.root.config.hotspots,
                hotspot: [
                  ...existingConfig.file.root.config.hotspots.hotspot,
                  ...update.hotspots.hotspot
                ]
              },
              images: update.images,
            }
          }
        }
      });
    }

    if (interiorHotspots && interiorHotspots.length) {
      hotSpotsUpdate.interiorHotspots = interiorHotspots;
    }

    await Vehicle360.findOneAndUpdate({ stockid }, hotSpotsUpdate);
    res.json({ status: 'success' });
  } catch (error) {
    next(new InternalServerError(error));
  }
}

exports.deleteHotspotById = async (req, res, next) => {
  const { stockid, currentView, hotspotid } = req.params;
  try {
    const vehicleConfig = await Vehicle360.findOne({ stockid }).lean();
    if (currentView === 'exterior') {
      const { file } = await XMLFileConfig.findById(vehicleConfig.xml).lean();
      const currentHotspot = vehicleConfig.exteriorHotspots.find(({ id }) => id === hotspotid);
      const newVehicleHotspots = vehicleConfig.exteriorHotspots.filter(({ id }) => id !== hotspotid);
      const newFileHotspots = file.root.config.hotspots.hotspot.filter(h => h['@_id'] !== hotspotid);
      const newFileImages = file.root.config.images.image.map(img => {
        if (img['@_label'] === currentHotspot.title) {
          delete img['@_label'];
        }
        img.hotspot = img.hotspot.filter(h => h['@_source'] !== hotspotid);
        return img;
      });

      await Vehicle360.findOneAndUpdate({ stockid }, { exteriorHotspots: newVehicleHotspots });
      await XMLFileConfig.findByIdAndUpdate(vehicleConfig.xml, {
        file: {
          ...file,
          root: {
            ...file.root,
            config: {
              ...file.root.config,
              hotspots: {
                ...file.root.config.hotspots,
                hotspot: newFileHotspots,
              },
              images: {
                ...file.root.config.images,
                image: newFileImages,
              },
            },
          },
        },
      });
    } else {
      const newVehicleHotspots = vehicleConfig.interiorHotspots.filter(({ id }) => id !== hotspotid);
      await Vehicle360.findOneAndUpdate({ stockid }, { interiorHotspots: newVehicleHotspots });
    }

    res.json({ status: 'success' });
  } catch (error) {
    next(new InternalServerError(error));
  }
}