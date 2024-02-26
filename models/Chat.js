const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
        default:null
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: false,
        default:null
    },
    groupChatId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"groupChat",
        default:null
    }, 
    content: {
        type: String,
        require: false,
        default:null
    },
    file: {
        type: Array, 
        require: false,
        default:[]
    },
    isRead: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    readBy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: false,
        default:null
    }],
}, { timestamps: true });

mongoose.model('chat',chatSchema);
// module.exports=mongoose.model('chat',chatSchema);