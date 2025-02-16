/**
 * -------------------------------------------------------------------
 * Author: Sasmithx
 * GitHub: https://github.com/sasmithx
 * Website: https://sasmithx.com
 * -------------------------------------------------------------------
 * Created: 2/12/2025 10:34 AM
 * Project: VanguardVote-BACKEND
 * -------------------------------------------------------------------
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes")
const pollRoutes = require("./routes/pollRoutes")

const connectDB = require("./config/db");

const app = express();

//Middleware to handle CORS
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/poll", pollRoutes);

//Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));