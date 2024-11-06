const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  status: { type: String, default: "pending" },
  image: String,
  userEmail: { type: String, required: true },
  reminderSent: { type: Boolean, default: false },
});

module.exports = mongoose.model("Todo", todoSchema);
