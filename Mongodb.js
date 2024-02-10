const mongoose = require("mongoose");

const db = process.env.DB;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");
  } catch (err) {
    console.log("Connection Failed!");
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
