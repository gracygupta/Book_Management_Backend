const mongoose = require("mongoose");
const validator = require("validator");

const bookSchema = new mongoose.Schema({
  name: String,
  isbn_no: Number,
  author_name: String,
  genre: String,
  inventory: Number,
});
