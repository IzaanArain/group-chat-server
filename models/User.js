const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
      trim: true,
      default: null,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    name: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    location: {
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
   timestamps:true
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

userSchema.methods.comparePassword = async function (password) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      if (!isMatch) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

userSchema.methods.generateAuthToken=async function (){
  const user = this;
  const token=jwt.sign({userId:user._id},process.env.SECRET_TOKEN);
  user.token=token;
  await user.save();
  return token;
}
mongoose.model("User", userSchema);
// module.exports=mongoose.model("User", userSchema);
