const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    chatName: {
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
      ref: "message",
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

mongoose.model("chat", chatSchema);
// module.exports= mongoose.model("groupChat",groupChatSchema);
