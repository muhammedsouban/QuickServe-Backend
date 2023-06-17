
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
    },
    message: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

const Message = mongoose.model('Message', messageSchema);

export default Message
