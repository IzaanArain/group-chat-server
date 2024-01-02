const express=require("express");
const { register,login,otpVerify } = require("../controllers/User");

const router=express.Router();

router.post("/user/signup",register);
router.post("/user/signin",login);
router.post("/user/otpVerify",otpVerify);

module.exports=router