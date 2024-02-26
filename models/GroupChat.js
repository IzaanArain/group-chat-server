const mongoose = require("mongoose");

const groupChatSchema = mongoose.Schema(
  {
    groupName: {
      type: String,
      trim: true,
      default: null,
    },
    isGroupChat: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      default: null,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

mongoose.model("groupChat", groupChatSchema);
// module.exports= mongoose.model("groupChat",groupChatSchema);
