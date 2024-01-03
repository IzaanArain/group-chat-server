const express = require("express");
const {
  register,
  login,
  otpVerify,
  socialLogin,
  resendOtp,
  forgetPassword,
  resetPassword,
  completeProfile
} = require("../controllers/User");
const userAuth=require("../middlewares/Auth");
const {upload}=require("../middlewares/Multer");
const router = express.Router();

router.post("/user/signup", register);
router.post("/user/signin", login);
router.post("/user/otpVerify", otpVerify);
router.post("/user/socialLogin", socialLogin);
router.post("/user/resendOtp", resendOtp);
router.post("/user/forgetPassword", forgetPassword);
router.post("/user/resetPassword", resetPassword);
router.post("/user/completeProfile", userAuth, upload.fields([{name:"profileImage"}]), completeProfile);

module.exports = router;
