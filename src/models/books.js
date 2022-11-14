const mongoose = require("mongoose");
const validator = require("validator");

//defining structure of book
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

//defining structure of user
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email Invalid");
        }
      },
    },
    name: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Books" }],
  },
  { timestamps: true }
);
//creating new collection
const Book = new mongoose.model("Books", bookSchema);
const User = new mongoose.model("Users", userSchema);

//Exporting collection object
module.exports = { Book, User };
