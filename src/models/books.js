const mongoose = require("mongoose");
const validator = require("validator");

//defining structure
const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isbn_no: {
    type: Number,
    required: true,
    unique: [true, "Book id already present"],
  },
  author_name: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  inventory: {
    type: Number,
    default: 0,
    min: 0,
  },
});

//creating new collection
const Book = new mongoose.model("Books", bookSchema);

//Exporting collection object
module.exports = Book;
