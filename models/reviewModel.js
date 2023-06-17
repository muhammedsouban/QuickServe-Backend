import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    rating: {
        type: Number,
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
    date:{
        type:Date,
        default: Date.now,
    },
    services: [{
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },
    }],
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
