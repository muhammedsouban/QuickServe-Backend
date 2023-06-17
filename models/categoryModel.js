import mongoose from "mongoose";

const category = mongoose.Schema({
    categoryName: {
        type: String
    },
    image: {
        type: String
    },
    isDelete: {
        type: Boolean,
        default:false
    }
})

const Category = mongoose.model("category", category)

export default Category;