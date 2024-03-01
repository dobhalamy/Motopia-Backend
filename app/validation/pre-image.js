const path = require("path");

const preImage = (req, res, next) => {
  const { file, files, method } = req;
  const methods = ['POST', 'PATCH', 'PUT'];

  if (!file || !files) {
    return next();
  }

  if (file) {
    if (methods.includes(method)) {
      const fileExtanstion = path.extname(file.originalname).split(".")[1];
      const imageExtArr = ["jpg", "jpeg", "svg", "png"];
      if (!imageExtArr.includes(fileExtanstion)) {
        res.status(400);
        res.send(
          "Wrong file extension. Must be an image. SVG, PNG, JPG or JPEG"
        );
      } else next();
    } else next();
  }

  if (files) {
    if (methods.includes(method)) {
      Object.keys(files)
        .forEach((key) => {
          let singleFile = files[key]
          if (singleFile instanceof Array && singleFile[0]) {
            singleFile = singleFile[0]
          }

          if (singleFile) {
            const fileExtanstion = path.extname(singleFile.originalname).split(".")[1];
            const imageExtArr = ["jpg", "jpeg", "svg", "png"];
            if (!imageExtArr.includes(fileExtanstion)) {
              res.status(400);
              return res.send(
                "Wrong file extension. Must be an image. SVG, PNG, JPG or JPEG"
              );
            }
          }
        })
    }

    next();
  }
};

module.exports = preImage;
