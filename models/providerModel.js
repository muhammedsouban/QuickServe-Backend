import mongoose from "mongoose";

const providerSchema = mongoose.Schema({
    providername: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    location: {
        type: String,
    },
    pincode: {
        type: Number,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
    },
    category: {
        type: String,
    },
    experience: {
        type: String,
    },
    availability: {
        type: String,
    },
    language: {
        type: String,
    },
    jobdescription: {
        type: String,
    },
    image: {
        type: String,
    },
    joinedon: {
        type: Date,
        default: Date.now
    },
    isBlock: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    }
});

const Provider = mongoose.model("provider", providerSchema);

export default Provider;
