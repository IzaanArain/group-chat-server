const mongoose = require("mongoose");

const groupChatSchema = mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
    default: null,
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  groupMember: [
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
},{ timestamps: true });

mongoose.model("groupChat",groupChatSchema);
// module.exports= mongoose.model("groupChat",groupChatSchema);
