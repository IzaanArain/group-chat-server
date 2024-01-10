const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
// const User = mongoose.model("User");
const User=require("../models/User")

module.exports = (req, res, next) => {
  const authorization = req?.headers?.authorization || req?.headers?.["Authorization"];
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.SECRET_TOKEN, async (err, payload) => {
    if (err) {
      return res.status(401).send({ status: 0, message: "unauthorized" });
    }
    const { userId } = payload;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).send({ status: 0, message: "unauthorized" });
    } else if (user.token !== token) {
      return res.status(401).send({ status: 0, message: "unauthorized" });
    } else if (user.isVerified == 0) {
      return res.status(400).send({ status: 0, message: "User is not verified", user });
    } else if (user.isBlocked == 1) {
      return res.status(401).send({ status: 0, message: "User is blocked", user });
    } else if (user.isDeleted == 1) {
      return res.status(401).send({ status: 0, message: "User is deleted", user });
    } else if (user.token == token) {
      req.user = user;
      next();
    }
  });
};
