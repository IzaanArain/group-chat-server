const { hash } = require("bcrypt");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
      trim: true,
      default: null,
      lowercase: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    socialPhone: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    profileImage: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    otp: {
      type: Number,
      required: false,
      trim: true,
      default: null,
    },
    isVerified: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      default: null,
    },
    isProfileCompleted: {
      type: Number,
      default: 0,
    },
    isForgetPassword: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Number,
      default: 0,
    },
    socialToken: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    socialType: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    deviceType: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    deviceToken: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      user.password = hashedPassword;
      next();
    });
  });
});

userSchema.methods.genAuthToken=async function(){
  
}
module.exports = mongoose.model("Users", userSchema);
