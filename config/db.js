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

/*
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error("Error Connecting to MongoDB", err);
        process.exit(1);
    }
};

module.exports = connectDB;*/

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (err) {
        console.error("Error Connecting to MongoDB", err);
        process.exit(1);
    }
};

module.exports = connectDB;

