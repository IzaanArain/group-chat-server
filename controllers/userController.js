const mongoose = require("mongoose");
const User = mongoose.model("User");

exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const keyword = req.query.search;
    // console.log("params",req.params);
    // console.log("keyword",keyword);
    let filter={};
    console.log(keyword);
    if(keyword){
      filter={
        $and: [
            {
                $expr: {
                  $ne: ["$_id", new mongoose.Types.ObjectId(userId)],
                },
            },
            {
              $or: [
                // {name: new RegExp(keyword, "i")},
                // {email: new RegExp(keyword, "i")},
                // { email: { $regex: keyword, $options: "i" } },
                { name: { $regex: keyword, $options: "i" } },
              ],
            },
          ],
    }
    }else{
      filter={
        $expr: {
          $ne: ["$_id", new mongoose.Types.ObjectId(userId)],
        },
      }
    };
    
    const users = await User.aggregate([
      {
        $match: filter
      },
      {
        $project:{
            name:1,
            email:1,
            profileImage:1,
            location:1
        }
      }
    ]);
    return res.status(200).send({
      status: 1,
      message:"Successfully retrieved user data",
      data: users,
    });
  } catch (err) {
    console.error("Error", err.message);
    return res.status(500).send({
      status: 0,
      message: "Something went wrong",
      err: err.message,
    });
  }
};
