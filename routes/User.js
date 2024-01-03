const express = require("express");
const {
  register,
  login,
  otpVerify,
  socialLogin,
  resendOtp,
  forgetPassword,
  resetPassword,
} = require("../controllers/User");

const router = express.Router();

router.post("/user/signup", register);
router.post("/user/signin", login);
router.post("/user/otpVerify", otpVerify);
router.post("/user/socialLogin", socialLogin);
router.post("/user/resendOtp", resendOtp);
router.post("/user/forgetPassword", forgetPassword);
router.post("/user/resetPassword", resetPassword);

module.exports = router;
