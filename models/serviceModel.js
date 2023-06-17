import mongoose from "mongoose";

const serviceSchema = mongoose.Schema({
  servicename: {
    type: String,
  },
  description: {
    type: String,
  },
  serviceincludes: {
    type: String,
  },
  category: {
    type: String,
  },
  price: {
    type: String,
  },
  image:{
    type:String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

const Service = mongoose.model("service", serviceSchema);

export default Service;