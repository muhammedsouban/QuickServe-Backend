import mongoose from "mongoose";

const city = mongoose.Schema({
    cityName: {
        type: String
    },
    isDelete: {
        type: Boolean,
        default:false
    }
})

const City = mongoose.model("city", city)
export default City;