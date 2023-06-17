import mongoose from "mongoose";

const booking = new mongoose.Schema({
    BookingID: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    services: [
        {
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Service',
            },
            quantity: {
                type: Number,
            },
            providerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Provider',
            },
            status: {
                type: String,
            },
        },
    ],
    date: {
        type: Date,
    },
    startTime: {
        type: String,

    },
    totalPrice: {
        type: Number,

    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model("booking", booking);

export default Booking;
