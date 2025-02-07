const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv/config");
const { db } = require("./config/dbConfig.js");
const authRoutes = require("./routes/auth.js");
const hotelRoutes = require("./routes/hotelRoutes.js");
const dbConnection = mongoose.connection;

const PORT = process.env.PORT || 5000;

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to the MongoDB database
db();

// Routes
app.use("/auth", authRoutes);
app.use("/hotel", hotelRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend Working" });
});

// Listen on the port
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// Listen for MongoDB connection events
dbConnection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);
dbConnection.once("open", () => {
  console.log("Connected to MongoDB");
});
