const mongoose = require("mongoose")

// Define the schema for the File model
const FileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  password: String,
  downloadCount: {
    type: Number,
    required: true,
    default: 0,
  },
})

// Export the File model based on the defined schema
module.exports = mongoose.model("File", FileSchema)