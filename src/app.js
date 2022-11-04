//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const Book = require("./models/books");
const port = process.env.PORT || 8080;

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.send("thanku");
});

//shows all books record
app.get("/books", async (req, res) => {
  try {
    const booksData = await Book.find();
    res.send(booksData);
  } catch (e) {
    res.send(e);
  }
});

//create new book record
app.post("/books", async (req, res) => {
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
      console.log(res.statusCode);
      res.send("Oop! Some error occured. PLease check and try again.");
      console.log(err);
    });
});

//delete all books records
app.delete("/books", async (req, res) => {
  try {
    Book.remove({});
    console.log("All records deleted");
    res.send("All Documents deleted");
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

//returns books having value less than n in inventory
app.get("/books/find_books_needed", async (req, res) => {
  const n = req.query.n;
  console.log("Value of n = " + n);
  var result = "";
  if (n === undefined) {
    result = "Please specify query n in the url.";
    console.log("n not specified");
  } else {
    const booksData = await Book.find({ inventory: { $lt: n } });
    result = booksData;
    console.log("Data retrieved");
  }
  res.send(result);
});

//returns all books with inventory 0
app.get("/books/unavailable_books", async (req, res) => {
  const booksData = await Book.find({ inventory: 0 });
  console.log(booksData);
  var result = "";
  if (booksData.length === 0) {
    console.log("No books to show");
    result = "No books to show";
  } else {
    result = booksData;
  }
  res.send(result);
});

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
app.listen(port, function () {
  console.log(`Server is up ${port}`);
});
