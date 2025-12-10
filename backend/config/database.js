const mongoose = require("mongoose");
require("dotenv").config();

const connect = () => {
  mongoose.connect(process.env.DATABASE_URL)
    .then(() => { console.log("Database connection successful") })
    .catch(() => { console.log("database se connect nahi hua") });
};

module.exports = { connect }; 