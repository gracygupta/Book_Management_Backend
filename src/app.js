const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const app = express();

//home route
app.get("/", function (req, res) {
  res.send("Thankyou logging in");
});

//shows all books record
app.get("/books", function (req, res) {});

//crete new book record
app.post("/books", function (req, res) {
  res.send("Thankyou logging in");
});

//delete all books records
app.delete("/books", function (req, res) {});

//returns books having value less than n in inventory
app.get("/books/find_books_needed", function (req, res) {});

//returns all books with inventory 0
app.get("/books/unavailable_books", function (req, res) {});

//fetch records of particular book
app.get("/book/:isbn_no", function (req, res) {});

//replace records of a book with aother book record
app.put("/book/:isbn_no", function (req, res) {});

//update some fields off a book record
app.patch("/book/:isbn_no", function (req, res) {});

//delete record of a book
app.patch("/book/:isbn_no", function (req, res) {});

//issue book: decrease inventory
app.get("/book/:isbn_no", function (req, res) {});

//listens to port 3000
app.listen(3000, function () {
  console.log("Server is up");
});
