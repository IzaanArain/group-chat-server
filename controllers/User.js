const User = require("../models/User");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const {
      email: typed_email,
      password: typed_password,
      confirmedPassword,
      deviceType,
      deviceToken
    } = req.body;
    if (!typed_email) {
      return res.status(400).send({
        status: 0,
        message: "please enter email",
      });
    } else if (
      !typed_email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      return res.status(400).send({
        status: 0,
        message: "please enter valid email",
      });
    } else if (!typed_password) {
      return res.status(400).send({
        status: 0,
        message: "please enter password",
      });
    } else if (
      !typed_password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
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
    } else if (
      !confirmedPassword.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
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
      otp:123456,
      deviceType,
      deviceToken
    });
    await user.save();
    res.status(200).send({
      status: 1,
      message: "user registered succesfully",
    });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

const otpVerify=async(req,res)=>{
  try{
    const {otp,userId}=req.body;
    if (!otp) {
      return res.status(400).send({ status: 0, message: "OTP field can't be empty." });
    } else {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(400).send({ status: 0, message: "Invalid User" });
      } else {
        if (otp != user.otp) {
          return res.status(400).send({ status: 0, message: "Invalid OTP Verification Code." });
        } else {
          // await user.generateAuthToken();
          user.isVerified = 1;
          user.save();
          return res.status(200).send({ status: 1, message: "Account Verified successfully", data: user });
        }
      }
    }
  }catch(err){
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
}
const login = async (req, res) => {
  try {
    const { email: typed_email, password: typed_password,deviceType,deviceToken } = req.body;
    if (!typed_email) {
      return res.status(400).send({
        status: 0,
        message: "please enter email",
      });
    } else if (
      !typed_email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      return res.status(400).send({
        status: 0,
        message: "please enter valid email",
      });
    } else if (!typed_password) {
      return res.status(400).send({
        status: 0,
        message: "please enter password",
      });
    } else if (
      !typed_password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
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
    const isMatch=await  bcrypt.compare(typed_password, user.password)
   if(!isMatch){
    return res.status(400).send({ status: 0, message: "Invalid password" });
   } else if (user?.isDeleted == 1) {
    return res.status(200).send({ status: 1, message: `Account is deleted` });
  } else if (user.isVerified === 0) {
    return res.status(400).send({ status: 0, message: "User is Not Verified"});
  }else{
    await user.generateAuthToken();
    user.deviceType = deviceType;
    user. deviceToken =  deviceToken;
    await user.save();
    res.status(200).send({ status: 1, message: "Login successfully", data: user });
  }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  register,
  otpVerify,
  login,
};
