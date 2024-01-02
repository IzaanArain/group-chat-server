const express=require("express");
const { register,login,otpVerify,socialLogin } = require("../controllers/User");

const router=express.Router();

router.post("/user/signup",register);
router.post("/user/signin",login);
router.post("/user/otpVerify",otpVerify);
router.post("/user/socialLogin",socialLogin);

module.exports=router