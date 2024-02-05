const mongoose=require("mongoose");
const Chat=mongoose.model("chat");
const sendMessage=async(req,res)=>{
    try {
        const {sender_id}=req.body
        if(sender_id){
            return res.status(400).send({
                status:1,
                message:"Sender ID is required!"    
            })
        } 
        const message=await Chat.find({

        });
        
    }catch(err) {
        console.error("Error", err.message);
        return res.status(500).send({
          status: 0,
          message: "Something went wrong",
          err: err.message,
        });
    }
}