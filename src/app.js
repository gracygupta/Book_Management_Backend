//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const Book = require("./models/books");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {});

//shows all books record

app.get("/books", function (req, res) {
  res.sendFile(__dirname + "/html/book_add.html");
});

//create new book record
app.post("/books", function (req, res) {
  console.log(req.body);

  const bname = req.body.name;
  const bn_no = req.body.isbn_no;
  const author = req.body.author_name;
  const genre = req.body.genre;
  const inventory = req.body.inventory;

  const book = new Book({
    name: bname,
    isbn_no: bn_no,
    author_name: author,
    genre: genre,
    inventory: inventory,
  });

  book
    .save()
    .then(function () {
      res.send("Book Record Added.");
    })
    .catch(function (err) {
      res.send("Oop! Some error occured. PLease check and try again.");
      console.log(err);
    });
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
app.listen(process.env.PORT || 3000, function () {
  console.log("Server is up");
});
