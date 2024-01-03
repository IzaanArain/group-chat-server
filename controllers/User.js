const bcrypt = require("bcrypt");
const mongoose=require("mongoose");
const { use } = require("../routes/User");
const User=mongoose.model("User");
// const User = require("../models/User");

const register = async (req, res) => {
  try {
    const {
      email: typed_email,
      password: typed_password,
      confirmedPassword,
      deviceType,
      deviceToken,
    } = req.body;
    const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!typed_email) {
      return res.status(400).send({
        status: 0,
        message: "please enter email",
      });
    } else if (!typed_email.match(emailValidation)) {
      return res.status(400).send({
        status: 0,
        message: "please enter valid email",
      });
    } else if (!typed_password) {
      return res.status(400).send({
        status: 0,
        message: "please enter password",
      });
    } else if (!typed_password.match(passwordValidation)) {
      return res.status(400).send({
        status: 0,
        message:
          "Password should include at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.",
      });
    } else if (!confirmedPassword) {
      return res.status(400).send({
        status: 0,
        message: "please enter confirm password",
      });
    } else if (!confirmedPassword.match(passwordValidation)) {
      return res.status(400).send({
        status: 0,
        message:
          "Confirm password should include at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.",
      });
    } else if (typed_password !== confirmedPassword) {
      return res.status(400).send({
        status: 0,
        message: "password should match confirmed password",
      });
    }
    const userExists = await User.findOne({ email: typed_email });
    if (userExists) {
      return res.status(400).send({
        status: 0,
        message: "user is already registered",
      });
    }
    const gen_otp_code = Math.floor(Math.random() * 900000) + 100000;
    const user = new User({
      email: typed_email,
      password: typed_password,
      otp: 123456,
      deviceType,
      deviceToken,
    });
    await user.save();
    res.status(200).send({
      status: 1,
      message: "user registered succesfully",
      data: {
        userId: user._id,
      },
    });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    if (!otp) {
      return res
        .status(400)
        .send({ status: 0, message: "OTP field can't be empty." });
    } else {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(400).send({ status: 0, message: "Invalid User" });
      } else {
        if (otp != user.otp) {
          return res
            .status(400)
            .send({ status: 0, message: "Invalid OTP Verification Code." });
        } else {
          // await user.generateAuthToken();
          user.isVerified = 1;
          user.save();
          return res.status(200).send({
            status: 1,
            message: "Account Verified successfully",
            data: user,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const login = async (req, res) => {
  try {
    const {
      email: typed_email,
      password: typed_password,
      deviceType,
      deviceToken,
    } = req.body;
    const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!typed_email) {
      return res.status(400).send({
        status: 0,
        message: "please enter email",
      });
    } else if (!typed_email.match(emailValidation)) {
      return res.status(400).send({
        status: 0,
        message: "please enter valid email",
      });
    } else if (!typed_password) {
      return res.status(400).send({
        status: 0,
        message: "please enter password",
      });
    } else if (!typed_password.match(passwordValidation)) {
      return res.status(400).send({
        status: 0,
        message:
          "Password should include at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.",
      });
    }
    const user = await User.findOne({ email: typed_email });
    if (!user) {
      return res.status(400).send({
        status: 0,
        message: "user not found",
      });
    }
    // const isMatch=await user.comparePassword(typed_password);
    const isMatch = await bcrypt.compare(typed_password, user.password);
    if (!isMatch) {
      return res.status(400).send({ status: 0, message: "Invalid password" });
    } else if (user?.isDeleted == 1) {
      return res.status(200).send({ status: 1, message: `Account is deleted` });
    } else if (user.isVerified === 0) {
      return res
        .status(400)
        .send({ status: 0, message: "User is Not Verified" });
    } else {
      await user.generateAuthToken();
      user.deviceType = deviceType;
      user.deviceToken = deviceToken;
      await user.save();
      res
        .status(200)
        .send({ status: 1, message: "Login successfully", data: user });
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const socialLogin = async (req, res) => {
  try {
    const { socialToken, socialType, deviceToken, deviceType, socialPhone } =
      req.body;
    if (!socialToken) {
      return res
        .status(400)
        .send({ status: 0, message: "User Social Token field can't be empty" });
    } else if (!socialType) {
      return res
        .status(400)
        .send({ status: 0, message: "User Social Type field can't be empty" });
    } else {
      const user = await User.findOne({ socialToken: socialToken });
      if (!user) {
        const newUser = new User({
          socialToken,
          socialType,
          deviceToken,
          deviceType,
          socialPhone,
        });
        await newUser.save();
        newUser.isVerified = 1;
        await newUser.generateAuthToken();
        return res.status(200).send({
          status: 1,
          message: "Account Created Successfully",
          data: newUser,
        });
      } else {
        const userDeleted = user?.isDeleted;
        const user_blocked = user?.isBlocked;
        if (userDeleted === 1) {
          return res.status(200).send({
            status: 0,
            message: "user account has been deleted",
          });
        } else if (user_blocked === 1) {
          return res.status(200).send({
            status: 0,
            message: "user account has been blocked",
          });
        } else {
          user.isVerified = 1;
          user.deviceToken = deviceToken;
          user.deviceType = deviceType;
          await user.save();
          await user.generateAuthToken();
          return res.status(200).send({
            status: 1,
            message: "social login successful",
            data: user,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).send({ status: 0, message: "Invalid User" });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      user.otp = 123456;
      await user.save();
      return res.status(200).send({
        status: 1,
        message: "We have resend  OTP verification code at your email address",
        data: { userId: user._id },
      });
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!email) {
      return res
        .status(400)
        .send({ status: 0, message: "Email field can't be empty" });
    } else if (!email.match(emailValidation)) {
      return res
        .status(400)
        .send({ status: 0, message: "Invalid email address" });
    }
    if (!user) {
      return res.status(400).send({ status: 0, message: "User not found" });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      user.otp = 123456;
      user.token = null;
      user.isVerified = 0;
      user.isForget = 1;
      await user.save();
      return res.status(200).send({
        status: 1,
        message: "OTP verification code has been sent to your email.",
        data: { _id: user._id },
      });
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, userId } = req.body;
    const passwordValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!newPassword) {
      return res
        .status(400)
        .send({ status: 0, message: "New Password field can't be empty" });
    } else if (!newPassword.match(passwordValidation)) {
      return res.status(400).send({
        status: 0,
        message:
          "Password should be 8 characters long (should contain uppercase, lowercase, numeric and special character)",
      });
    } else if (!confirmNewPassword) {
      return res
        .status(400)
        .send({ status: 0, message: "Confirm Password field can't be empty" });
    } else if (!confirmNewPassword.match(passwordValidation)) {
      return res.status(400).send({
        status: 0,
        message:
          "Password should be 8 characters long (should contain uppercase, lowercase, numeric and special character)",
      });
    } else if (newPassword != confirmNewPassword) {
      return res.status(400).send({
        status: 0,
        message: "New Password and Confirm New Password must be same",
      });
    } else {
      const userCheck = await User.findOne({ _id: userId });
      if (!userCheck) {
        return res.status(400).send({ status: 0, message: "User not found" });
      } else if (userCheck.isVerified === 0) {
        return res
          .status(400)
          .send({ status: 0, message: "Verify your account" });
      } else {
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(newPassword, salt);
        const user = await User.findByIdAndUpdate(
          { _id: userCheck._id },
          { $set: { password: hashedPassword, isForget: 0 } },
          { new: true }
        );
        res.status(200).send({
          status: 1,
          message: "Password changed successfully",
          data: user,
        });
      }
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const completeProfile = async (req, res) => {
  try {
    const userId = req?.user?._id;
    const { name, phone, location } = req.body;
    const profileImage = req?.files?.profileImage;
    const profileImagePath = profileImage
      ? profileImage[0]?.path.replace(/\\/g, "/")
      : null;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        location,
        profileImage: profileImagePath,
        isProfileCompleted: 1,
      },
      { new: true }
    );
    return res.status(200).send({
      status: 1,
      message: "complete profile successful",
      data: user,
    });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const changePassword= async (req,res)=>{
  try{
    const userId=req?.user?._id;
    const { existingPassword, confirmNewPassword, newPassword } = req.body;
    const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const userCheck = await User.findOne({ _id: userId });
    const isMatch = await bcrypt.compare(existingPassword, userCheck.password);
    if (!isMatch) {
      return res.status(400).send({ status: 0, message: "Invalid Current Password" });
    } else if (!newPassword) {
      return res.status(400).send({ status: 0, message: "New Password field can't be empty" });
    } else if (!newPassword.match(passwordValidation)) {
      return res.status(400).send({ status: 0, message: "Password should be 8 characters long (should contain uppercase, lowercase, numeric and special character)" });
    } else if (!confirmNewPassword) {
      return res.status(400).send({ status: 0, message: "Confirm New Password field can't be empty" });
    } else if (!confirmNewPassword.match(passwordValidation)) {
      return res.status(400).send({ status: 0, message: "Password should be 8 characters long (should contain uppercase, lowercase, numeric and special character)" });
    } else if (newPassword !== confirmNewPassword) {
      return res.status(400).send({ status: 0, message: "New Password and Confirm New Password should be same" });
    } else if (existingPassword == newPassword || existingPassword == confirmNewPassword) {
      return res.status(400).send({ status: 0, message: "Current password and new password can't be same" });
    } else if (!userCheck) {
      return res.status(400).send({ status: 0, message: "User Not Found" });
    } else {
      await userCheck.comparePassword(existingPassword);
      const salt = await bcrypt.genSalt(10);
      const pass = await bcrypt.hash(newPassword, salt);
      await User.findByIdAndUpdate({ _id: userId }, { $set: { password: pass } });
      res.status(200).send({ status: 1, message: "Password changed successfully" });
    }
  }catch(err){
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const deleteProfile=async (req, res)=>{
  try{
    const userId=req.user._id;
    const deleteUser = await User.findByIdAndUpdate({ _id: userId }, { $set: { isDeleted: 1 } });
    if (deleteUser) {
      res.status(200).send({ status: 1, message: "Account deleted successfully" });
    } else {
      return res.status(400).send({ status: 0, message: "User not found" });
    }
  }catch(err){
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const signOut=async (req,res)=>{
  try{
    const userId=req.user._id;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).send({ status: 0, message: "User not found" });
    } else {
      user.token = null;
      user.deviceType = null;
      user.deviceToken = null;
      user.save();
      res.status(200).send({ status: 1, message: "Logout successfully" });
    }
  }catch (err){
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
}
module.exports = {
  register,
  otpVerify,
  login,
  socialLogin,
  resendOtp,
  forgetPassword,
  resetPassword,
  completeProfile,
  changePassword,
  deleteProfile,
  signOut,
};
