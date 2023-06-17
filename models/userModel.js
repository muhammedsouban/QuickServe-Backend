import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  image: {
    type: String
  },
  password: {
    type: String
  },
  Cart: {
    type: Array
  },
   Address: {
    type: Array
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
});

const User = mongoose.model("user", userSchema);

export default User;