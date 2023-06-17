import mongoose from "mongoose";

const admin = mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    }
})

const Admin = mongoose.model("admin", admin)

export default Admin;