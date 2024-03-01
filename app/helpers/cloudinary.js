const cloudinary = require("cloudinary").v2;
const config = require("../../config");
const path = require("path");
cloudinary.config(config.get("Cloudinary"));

exports.uploadImage = (file, foldername) => {
  const filename = path.basename(file.originalname).split(".")[0];
  return cloudinary.uploader.upload(
    file.path,
    { folder: foldername, public_id: filename, format: 'webp' },
    function(error, result) {
      if (error) console.info("Cloudinary: ", error);
      return result;
    }
  );
};

exports.uploadCardIcon = (file, foldername) => {
  const filename = path.basename(file).split(".")[0];
  return cloudinary.uploader.upload(
    file,
    { folder: foldername, public_id: filename },
    function(error, result) {
      if (error) console.info("Cloudinary: ", error);
      return result;
    }
  );
};

exports.destroyImage = id => {
  return cloudinary.uploader.destroy(id, (error, result) => {
    if (error) console.info("Cloudinary: ", error);
    return result;
  });
};

exports.uploadHeroImage = (file, foldername, stockId) => {
  const filename = path.basename(file.originalname).split(".")[0];
  return cloudinary.uploader.upload(
    file.path,
    { folder: `${foldername}/${stockId}`, public_id: filename },
    function(error, result) {
      if (error) console.info("Cloudinary: ", error);
      return result;
    }
  );
};
