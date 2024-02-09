const mongoose = require("mongoose");
const Chat = mongoose.model("chat");
const User = mongoose.model("User");

exports.accessChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).send({
        status: 0,
        message: "Receiver ID is required!",
      });
    }else if(!mongoose.isValidObjectId(receiverId)){
        return res.status(400).send({
            status: 0,
            message: "Not a valid ID!",
          });
    }
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: receiverId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
    isChat = await User.populate(isChat, {
      path: "latestMessage.senderId",
      select: "name email profileImage",
    });
    if (isChat.length > 0) {
      res.send({
        status:1,
        message:"Successful",
        data:isChat[0]
      });
    }else{
        const chatData=new Chat({
            chatName:"sender",
            isGroupChat:false,
            users:[userId,receiverId],
        });;
        await chatData.save().populate("users", "-password")
        return res.status(200).send({
            status:1,
            message:"successful",
            data:chatData
        })
    }
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};
