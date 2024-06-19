const mongoose = require("mongoose");
const GroupChat = mongoose.model("groupChat");
const User = mongoose.model("User");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
exports.initiateChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).send({
        status: 0,
        message: "Receiver ID is required!",
      });
    } else if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).send({
        status: 0,
        message: "Not a valid ID!",
      });
    }
    let isChat = await GroupChat.findOne({  // find()
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: receiverId } } },
      ],
    })
      .populate("users", "name email profileImage") //-password
      .populate("latestMessage")
      .populate("latestMessage.senderId", "name email profileImage");
    // isChat = await User.populate(isChat, {
    //   path: "latestMessage.senderId",
    //   select: "name email profileImage",
    // });
    if (isChat) {
      //isChat.length > 0
      res.send({
        status: 1,
        message: "Chat already exists",
        data: isChat,
      });
    } else {
      const chatData = new GroupChat({
        isGroupChat: 0,
        users: [userId, receiverId],
      });
      await chatData.save();
      await chatData.populate("users", "name email profileImage"); //-password
      return res.status(200).send({
        status: 1,
        message: "Successful created individual chat",
        data: chatData,
      });
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

//@description     Fetching all chats for a user
//@route           GET /api/chat/
//@access          Protected
exports.fetchChats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Chat.find({users:{$elemMatch:{$eq:userId}}})
    // .then((result)=>{
    //   return res.status(200).send({
    //     status:1,
    //     message:"fetched user chats successfully",
    //     data:result
    //   })
    // }).catch((err)=>{
    // return res.status(200).send({
    //   status:1,
    //   message:"Chat not found",
    //   data:[]
    // })
    // })
    const totalChats = await GroupChat.countDocuments({
      users: { $elemMatch: { $eq: userId } },
    });
    const result = await GroupChat.find({
      users: { $elemMatch: { $eq: userId } },
    })
      .populate("users", "name email profileImage")
      .populate("groupAdmin", "name email profileImage")
      .populate("latestMessage")
      .sort({ createdAt: -1 }) // updatedAt
      .populate("latestMessage.sender", "name email profileImage");
    // .then(async(results)=>{
    //   results=await User.populate(results,{
    //     path:"latestMessage.sender",
    //     select:"name email profileImage"
    //   })
    // })
    if (result) {
      return res.status(200).send({
        status: 1,
        message: "fetched user chats successfully",
        data: {
          totalChats,
          chats: result,
        },
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "Chats not found",
        data: [],
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
exports.createGroupChat = async (req, res) => {
  try {
    const usersJson = req.body.users;
    const groupName = req.body.name;
    const groupDescription = req.body.description;
    // if(!req.body.users || !req.body.name){
    //   return res.status(400).send({
    //     status:0,
    //     message:"Please fill all the feilds"
    //   })
    // }
    if (!groupName) {
      return res.status(400).send({
        status: 0,
        message: "Please enter group name",
      });
    } else if (!usersJson) {
      return res.status(400).send({
        status: 0,
        message: "Please enter group users",
      });
    }
    const users = JSON.parse(usersJson);
    if (users.length < 2) {
      return res.status(400).send({
        status: 0,
        message: "More than 2 users are required to form a group chat",
      });
    }
    const groupImage =
      req?.files.groupImage && req?.files.groupImage.length > 0
        ? req?.files.groupImage[0].path
        : null;
    users.push(req?.user._id.toString());
    const groupChat = await GroupChat.create({
      groupName: groupName,
      groupDescription: groupDescription,
      groupImage: groupImage,
      users,
      isGroupChat: 1,
      groupAdmin: req?.user._id,
    });
    const fullGroupChat = await GroupChat.findOne({ _id: groupChat._id })
      .populate("users", "name email profileImage")
      .populate("groupAdmin", "name email profileImage");
    if (fullGroupChat) {
      return res.status(200).send({
        status: 1,
        message: "Chat fetched successfully",
        data: fullGroupChat,
      });
    } else {
      return res.status(400).send({
        status: 0,
        message: "Chat not found",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

exports.editGroup = async (req, res) => {
  try {
    const { groupId, name, description } = req.body;
    if (!groupId) {
      return res.status(400).send({
        status: 0,
        message: "Receiver ID is required!",
      });
    } else if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).send({
        status: 0,
        message: "Not a valid ID!",
      });
    } else if (!name) {
      return res.status(400).send({
        status: 0,
        message: "Name is required!",
      });
    }
    const isGroupChat = await GroupChat.findOne({ _id: groupId });
    if (isGroupChat.isGroupChat === 1) {
      const groupImage =
        req?.files.groupImage && req?.files.groupImage.length > 0
          ? req?.files.groupImage[0].path
          : isGroupChat.groupImage;
      const updateGroupName = await GroupChat.findByIdAndUpdate(
        groupId,
        {
          groupName: name ? name : isGroupChat.name,
          groupDescription: description ? description : isGroupChat.description,
          groupImage: groupImage ? groupImage : isGroupChat.groupImage,
        },
        { new: true }
      )
        .populate("users", "name email profileImage")
        .populate("groupAdmin", "name email profileImage");
      if (updateGroupName) {
        return res.status(200).send({
          status: 1,
          message: "Group renamed successfully",
          data: updateGroupName,
        });
      } else {
        return res.status(400).send({
          status: 0,
          message: "Failed to rename group, please try again",
        });
      }
    } else {
      return res.status(400).send({
        status: 0,
        message: "Not a group chat",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

exports.addToGroup = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const usersJson = req.body.users;
    const userIds = JSON.parse(usersJson);
    if (!groupId) {
      return res.status(400).send({
        status: 0,
        message: "Receiver ID is required!",
      });
    } else if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).send({
        status: 0,
        message: "Not a valid ID",
      });
    }
    if (usersJson && userIds.length > 0) {
      const newMemmbers = await GroupChat.findOneAndUpdate(
        { _id: groupId },
        // { $push: { users: userIds.map((id) => id) } },
        { $push: { users: { $each: userIds } } },
        { new: true }
      )
        .populate("users", "name email profileImage")
        .populate("groupAdmin", "name email profileImage");
      if (!newMemmbers) {
        return res.status(400).send({
          status: 0,
          message: "Group does not exist",
        });
      } else {
        return res.status(400).send({
          status: 0,
          message: "Group members added successfully",
          data: newMemmbers,
        });
      }
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

exports.removeFromGroup = async (req, res) => {
  try {
    const groupId = req?.body?.groupId;
    const usersJson = req?.body?.users;
    const userIds = JSON.parse(usersJson);
    if (!groupId) {
      return res.status(400).send({
        status: 0,
        message: "Receiver ID is required!",
      });
    } else if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).send({
        status: 0,
        message: "Not a valid ID",
      });
    }
    if (usersJson && userIds.length > 0) {
      const newMemmbers = await GroupChat.findOneAndUpdate(
        { _id: groupId },
        { $pull: { users: { $in: userIds } } },
        { new: true }
      )
        .populate("users", "name email profileImage")
        .populate("groupAdmin", "name email profileImage");
      if (!newMemmbers) {
        return res.status(400).send({
          status: 0,
          message: "Group does not exist",
        });
      } else {
        return res.status(400).send({
          status: 0,
          message: "Group members removed successfully",
          data: newMemmbers,
        });
      }
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const groupId = req?.body?.groupId;
    const userId = req.user._id;
    if (!groupId) {
      return res.status(400).send({
        status: 0,
        message: "Receiver ID is required!",
      });
    } else if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).send({
        status: 0,
        message: "Not a valid ID",
      });
    }
    if (!userId) {
      return res.status(400).send({
        status: 0,
        message: "Receiver ID is required!",
      });
    } else if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({
        status: 0,
        message: "Not a valid ID",
      });
    }
    const leavingMember = await GroupChat.findByIdAndUpdate(
      { groupId: groupId },
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "name email profileImage")
      .populate("groupAdmin", "name email profileImage");
    if (!leavingMember) {
      return res.status(400).send({
        status: 0,
        message: "Group does not exist",
      });
    } else {
      return res.status(400).send({
        status: 0,
        message: "Group members removed successfully",
        data: leavingMember,
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};
