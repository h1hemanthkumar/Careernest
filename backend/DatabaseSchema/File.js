const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  username: { type: String, required: true },
  details: { type: String, required: true },
  jobType: { type: String, enum: ["Full-Time", "Part-Time"], required: true },
  jobTitle: { type: String, required: true },
  city: { type: String, required: true },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", fileSchema);
