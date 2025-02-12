/**
 * -------------------------------------------------------------------
 * Author: Sasmithx
 * GitHub: https://github.com/sasmithx
 * Website: https://sasmithx.com
 * -------------------------------------------------------------------
 * Created: 2/12/2025 11:03 AM
 * Project: VanguardVote-BACKEND
 * -------------------------------------------------------------------
 */

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        /*const conn = await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,   // ❌ No longer needed
            // useUnifiedTopology: true,    // ❌ No longer needed
        });*/
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
};

// Event listeners for better logging
mongoose.connection.on("disconnected", () => console.log("⚠️ MongoDB Disconnected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB Error:", err));

module.exports = connectDB;


