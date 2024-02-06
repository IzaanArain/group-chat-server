const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupMemberSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "groupChat",
      default: null,
    },
    isAdmin: {
      type: Boolean,
      enum: [0, 1],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

mongoose.model("groupMember", groupMemberSchema);
