const mongoose = require("mongoose");
require("dotenv").config();

const DBconnection = async () => {
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URL;

  if (!mongoUrl) {
    console.error("MONGODB_URL is not set in environment variables.");
    return;
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log("DB Connected");
  } catch (e) {
    console.error("DB connection failed:", e.message);
  }
};

module.exports = DBconnection;
