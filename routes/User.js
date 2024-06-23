const express = require("express");
const router = express.Router();
const {
  register,
  login,
  otpVerify,
  socialLogin,
  resendOtp,
  forgetPassword,
  resetPassword,
  completeProfile,
  changePassword,
  signOut,
  deleteProfile,
  editProfile
} = require("../controllers/commonController");
const userAuth=require("../middlewares/Auth");
const {upload}=require("../middlewares/Multer");
const { getAllUsers } = require("../controllers/userController");
const { initiateChat, fetchChats, createGroupChat, editGroup, addToGroup, removeFromGroup, leaveGroup } = require("../controllers/chatControllers");
// common routes
router.post("/user/signup", register);
router.post("/user/signin", login);          
router.post("/user/otpVerify", otpVerify);
router.post("/user/socialLogin", socialLogin);
router.post("/user/resendOtp", resendOtp);
router.post("/user/forgetPassword", forgetPassword);
router.post("/user/resetPassword", resetPassword);
router.post("/user/completeProfile", userAuth, upload.fields([{name:"profileImage"}]), completeProfile);
router.post("/user/editProfile", userAuth, upload.fields([{name:"profileImage"}]), editProfile);
router.post("/user/changePassword", userAuth, changePassword);
router.post("/user/deleteProfile", userAuth, deleteProfile);
router.post("/user/signout", userAuth, signOut);
// user routes
router.get("/user/allUsers", userAuth, getAllUsers);
// chat routes
router.post("/user/initiateChat", userAuth, initiateChat);
router.get("/user/fetchChat", userAuth, fetchChats);
router.post("/user/createGroup", userAuth, createGroupChat); //upload.fields([{name:"groupImage",maxCount:1}])
router.post("/user/editGroup", userAuth, upload.fields([{name:"groupImage",maxCount:1}]),editGroup);
router.post("/user/addToGroup", userAuth, addToGroup);
router.post("/user/removeFromGroup", userAuth, removeFromGroup);
router.post("/user/leaveGroup", userAuth, leaveGroup);
// message routes

module.exports = router;
