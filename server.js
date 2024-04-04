require("dotenv").config(); // Load environment variables from .env file
const multer = require("multer"); // Import multer for file uploads
const mongoose = require("mongoose"); // Import mongoose for MongoDB interaction
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const File = require("./models/File"); // Import File model

const express = require("express"); // Import Express.js
const app = express(); // Create Express app
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

const upload = multer({ dest: "uploads" }); // Configure multer for file uploads

mongoose.connect(process.env.DATABASE_URL); // Connect to MongoDB database using DATABASE_URL from environment variables

app.set("view engine", "ejs"); // Set view engine to EJS

// Route to render index page
app.get("/", (req, res) => {
  res.render("index");
});

// Route to handle file uploads
app.post("/upload", upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path, // Store file path
    originalName: req.file.originalname, // Store original file name
  };
  if (req.body.password != null && req.body.password !== "") { // Check if password is provided
    fileData.password = await bcrypt.hash(req.body.password, 10); // Hash the password
  }

  const file = await File.create(fileData); // Create new file entry in the database

  res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` }); // Render index page with file download link
});

// Route to handle file download
app.route("/file/:id").get(handleDownload).post(handleDownload);

// Function to handle file download
async function handleDownload(req, res) {
  const file = await File.findById(req.params.id); // Find file by ID

  if (file.password != null) { // Check if file has password protection
    if (req.body.password == null) { // If password is not provided, render password input page
      res.render("password");
      return;
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) { // If password is incorrect, render password input page with error
      res.render("password", { error: true });
      return;
    }
  }

  file.downloadCount++; // Increment download count
  await file.save(); // Save file information

  res.download(file.path, file.originalName); // Download file
}

app.listen(process.env.PORT); // Start the server on specified port from environment variables
