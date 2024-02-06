const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
    chatId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat",
        default:null
    }, 
    message: {
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
    isBlocked: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
}, { timestamps: true });

mongoose.model('message',messageSchema);
// module.exports=mongoose.model('Message',chatSchema);