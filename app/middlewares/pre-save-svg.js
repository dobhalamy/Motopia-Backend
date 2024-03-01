const multer = require("multer");
const os = require("os");
const { v4: uuidv4 } = require('uuid');

const path = require("path");
let storeLocation; 

const upload = multer({
  dest: os.tmpdir()
  // storage: multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     const url=req.originalUrl;
  //     if (url.includes('hero')) {
  //       storeLocation = 'app/assets/uploads/heroImage';
  //     } else if (url.includes('carousel')) {
  //       storeLocation = 'app/assets/uploads/carouselImage';
  //     } else if (url.includes('promo')) {
  //       storeLocation = 'app/assets/uploads/promoImage';
  //     } else if (url.includes('warranty')){
  //       storeLocation = 'app/assets/uploads/warrantyImage';
  //     } else {
  //       storeLocation = 'app/assets/uploads/';
  //     }
  //     cb(null, storeLocation)
  //   },
  //   filename: (req, file, cb) => {
  //     let files = req.files || file;
  //     let customFileName = '';
  //     if (storeLocation.includes('heroImage') || storeLocation.includes('warrantyImage')) {
  //       if (files["img"]) {
  //         customFileName = "img" + req.body._id;
  //       }
  //       if (files["mobileImg"]) {
  //         customFileName = "mobile" + req.body._id;
  //       }
  //       if (files["mobileSrc"]) {
  //         customFileName = "mobile" + req.body._id;
  //       }
  //     } else {
  //       const rndm = uuidv4();
  //       customFileName = rndm + path.basename(file.originalname).split(".")[0];
  //     }
  //     const fileExtension = path.extname(file.originalname).split(".")[1];
  //     cb(null, customFileName + "." + fileExtension);
  //   }
  // })
});

module.exports = upload;
