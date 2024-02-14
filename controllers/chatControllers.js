const mongoose = require("mongoose");
const Chat = mongoose.model("chat");
const User = mongoose.model("User");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
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
    let isChat = await Chat.findOne({ // find()
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: receiverId } } },
      ],
    })
      .populate("users","name email profileImage")//-password
      .populate("latestMessage")
      .populate("latestMessage.senderId","name email profileImage")
    // isChat = await User.populate(isChat, {
    //   path: "latestMessage.senderId",
    //   select: "name email profileImage",
    // });
    if (isChat) { //isChat.length > 0
      res.send({
        status:1,
        message:"Successful",
        data:isChat
      });
    }else{
        const chatData=new Chat({
            chatName:"sender",
            isGroupChat:false,
            users:[userId,receiverId],
        });
        await chatData.save().populate("users", "name email profileImage")//-password
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

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
exports.fetchChats = async (req, res) => {
  try{
    const userId=req.user._id;
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
   const result = await Chat.find({users:{$elemMatch:{$eq:userId}}})
    .populate("users","name email profileImage")
    .populate("groupAdmin","name email profileImage")
    .populate("latestMessage")
    .sort({updatedAt:-1})
    .populate("latestMessage.sender","name email profileImage")
    // .then(async(results)=>{
    //   results=await User.populate(results,{
    //     path:"latestMessage.sender",
    //     select:"name email profileImage"
    //   })
    // })
      if(result){
        return res.status(200).send({
        status:1,
        message:"fetched user chats successfully",
        data:result
      })
      }else{
       return res.status(200).send({
        status:1,
        message:"Chats not found",
        data:[]
      }) 
      }
  }catch(err){
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
exports.createGroupChat = async(req,res)=>{
  try{
    const usersJson = req.body.users;
    const chatName = req.body.name;
    // if(!req.body.users || !req.body.name){
    //   return res.status(400).send({
    //     status:0,
    //     message:"Please fill all the feilds"
    //   })
    // }
    if
    (!chatName){
        return res.status(400).send({
        status:0,
        message:"Please enter group name"
      })
    }else if(usersJson){
        return res.status(400).send({
        status:0,
        message:"Please enter group users"
      })
    }
    const users=JSON.parse(usersJson);
    if (users.length < 2) {
      return res.status(400).send({
        status: 0,
        message: "More than 2 users are required to form a group chat",
      });
    }
    users.push(req?.user)
    const groupChat = await Chat.create({
      chatName: chatName,
      users,
      isGroupChat: true,
      groupAdmin: req?.user,
    })
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "name email profileImage")
      .populate("groupAdmin", "name email profileImage");
    if(fullGroupChat){
      return res.status(200).send({
        status:1,
        message:"Chat fetched successfully",
        data:fullGroupChat
      })
    }else{
      return res.status(400).send({
        status:0,
        message:"Chat not found",
      })
    }
  }catch(err){
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
}