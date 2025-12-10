const mongoose = require("mongoose");

const profileschema = new mongoose.Schema({
  gender: {
    type: String,
  },
  username: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contactnumber: {
    type: String,
  },
});

module.exports = mongoose.model("Profile", profileschema);
