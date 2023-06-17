import mongoose from "mongoose";

const mediaSchema = mongoose.Schema({
  Cards: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    title: {
      type: String
    },
    images: {
      type: Array
    }
  }],
  Adds: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    image: {
      type: String,
    },
  }],
  banner: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    image: {
      type: String,
    },
  }],
});

const Media = mongoose.model("media", mediaSchema);

export default Media;
