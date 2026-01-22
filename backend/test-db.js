import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing MongoDB Connection...");
console.log("URI:", process.env.MONGO_DB_URI ? "Found" : "Missing");

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("FAILURE: Could not connect.");
        console.error("Error:", err.message);
        process.exit(1);
    });
