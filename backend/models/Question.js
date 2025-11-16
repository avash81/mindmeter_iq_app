const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  answer: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    default: "general",
  },
});

module.exports = mongoose.model("Question", questionSchema);
