const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profileImage") {
      cb(null, "./uploads/profileImages/");
    }
    else if(file.fieldname === "groupImage"){
      cb(null, "./uploads/profileImages/");
    }
  },
  filename: function (req, file, cb) {
    const uniqueAffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueAffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file) {
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
});

module.exports = { upload };
