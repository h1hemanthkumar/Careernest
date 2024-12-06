const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Import the File model
const File = require("./DatabaseSchema/File");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Directory to store files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  },
});

const upload = multer({ storage });

app.use('/api/sign',require('./middleware/signup'))

// Handle file upload from React frontend
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { username, details, jobType, jobTitle, city } = req.body; // Ensure "jobTitle" is included
    const filePath = req.file.path;

    console.log("File Uploaded:", req.file);

    const newFile = new File({
      username,
      details,
      jobType,
      jobTitle, // Correctly map "jobTitle"
      city,
      filename: req.file.filename,
      filePath,
      fileType: req.file.mimetype,
    });

    await newFile.save();

    res.status(200).json({
      message: "File uploaded and saved to database successfully!",
      details,
      jobType,
      jobTitle,
      city,
      filename: req.file.filename,
      filePath: filePath,
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Error uploading file", error: err.message });
  }
});

app.get("/api/getUploads", async (req, res) => {
  try {
    const uploads = await File.find().sort({ createdAt: -1 }).limit(5); // Fetch 5 most recent uploads
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch uploads" });
  }
});

// Fetch all uploads
app.get("/api/getAllUploads", async (req, res) => {
  try {
    const uploads = await File.find().sort({ createdAt: -1 }); // Fetch all uploads sorted by creation date
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all uploads" });
  }
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
