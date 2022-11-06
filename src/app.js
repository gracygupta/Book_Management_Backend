//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const Book = require("./models/books");
const port = process.env.PORT || 8080;

const app = express();

// app.use("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.write("You are successfully Logined.");
  res.write("\nWelcome to the Home Page.");
  res.send();
  // message = "You are successfully Logined.";
  // res.render("home", { message: message });
});

//shows all books record
app.get("/books", async (req, res) => {
  try {
    const booksData = await Book.find();
    const result = booksData;
    console.log("Data Retrieved\n" + result);
    res.send(result);
  } catch (e) {
    res.send(e);
  }
});

//create new book record
app.post("/books", async (req, res) => {
  var result = "";
  try {
    console.log(req.body);
    const bname = req.body.name;
    const bn_no = parseInt(req.body.isbn_no);
    const author = req.body.author_name;
    const genre = req.body.genre;
    const inventory = parseInt(req.body.inventory);

    const book = new Book({
      isbn_no: bn_no,
      name: bname,
      author_name: author,
      genre: genre,
      inventory: inventory,
    });

    book
      .save()
      .then(function () {
        res.send("Book Record Added.");
      })
      .catch(async (err) => {
        console.log(res.statusCode);
        const book = await Book.find({ isbn_no: bn_no });
        if (book.length != 0) {
          result = "Book number already exist.";
        } else {
          if (inventory < 0) {
            result = "Inventory Invalid!! (Must be greater than 0)";
          }
        }
        console.log(err);
        res.send(result);
      });
  } catch (e) {
    console.log(e);
    res.send("Oop! Some error occured. PLease check and try again.");
  }
});

//delete all books records
app.delete("/books", async (req, res) => {
  try {
    const bookDel = Book.deleteMany({});
    bookDel
      .then(() => {
        console.log("success");
      })
      .catch((e) => {
        console.log(e);
      });
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

//handling get error when params are missing
app.get("/book", function (req, res) {
  res.send("Wrong path! Check URL");
});

//fetch records of particular book
app.get("/book/:isbn_no", async (req, res) => {
  var result = "";
  try {
    const isbn_no = req.params.isbn_no;
    const bookData = await Book.find({ isbn_no: isbn_no });
    if (bookData.length === 0) {
      result = "Book does not found";
      console.log(result);
    } else {
      console.log("Data retrieved");
      result = bookData;
    }
    res.send(result);
  } catch (e) {
    console.log(e);
    res.send("Oops! an error occured, please check URL and try again.");
  }
});

//replace records of a book with aother book record
app.put("/book/:from_isbn_no", async (req, res) => {
  try {
    const from_isbn_no = req.params.from_isbn_no;
    if (from_isbn_no) {
      const name = req.query.name;
      const genre = req.query.genre;
      const author = req.query.author_name;
      const to_isbn_no = parseInt(req.query.to_isbn_no);
      const inventory = parseInt(req.query.inventory);
      const bookUpdate = await Book.findOneAndReplace(
        { isbn_no: from_isbn_no },
        {
          isbn_no: to_isbn_no,
          name: name,
          genre: genre,
          author_name: author,
          inventory: inventory,
        }
      );
      console("Updated");
      console.log(bookUpdate);
    }
  } catch (e) {
    console.log(e);
    res.send("Oops! an error occured, please check URL and try again.");
  }
});

//update some fields off a book record
app.patch("/book/:isbn_no", async (req, res) => {
  try {
    const isbn_no = req.params.isbn_no;
    const bookData = await Book.find({ isbn_no: isbn_no });
    const name = req.query.name || bookData[0].name;
    const author = req.query.author || bookData[0].author_name;
    const genre = req.query.genre || bookData[0].genre;
    const inventory = parseInt(req.query.inventory || bookData[0].inventory);
    const bookUpdate = await Book.updateOne(
      { isbn_no: isbn_no },
      { name: name, author_name: author, genre: genre, inventory: inventory }
    );
    console.log(bookUpdate);
    res.send("Book records modified");
  } catch (e) {
    console.log(e);
    res.send("Book record does not find");
  }
});

//delete record of a book
app.delete("/book/:isbn_no", async (req, res) => {
  try {
    const isbn_no = req.params.isbn_no;
    if (isbn_no) {
      const bookDelete = await Book.deleteOne({ isbn_no: isbn_no });
      result = "Book deleted";
    } else {
      result = "isbn_no missing";
    }
    res.send(result);
  } catch (e) {
    res.send("Book record does not exist");
  }
});

//issue book: decrease inventory
app.get("/book/:isbn_no/:issue", async (req, res) => {
  try {
    var result = "";
    const isbn_no = req.params.isbn_no;
    const issue = req.params.issue.toLowerCase();
    const book = await Book.find({ isbn_no: isbn_no });
    console.log(book);
    if (issue == "true") {
      if (book[0].inventory > 0) {
        const inventory = book[0].inventory - 1;
        const issueBook = await Book.updateOne(
          { isbn_no: isbn_no },
          { inventory: inventory }
        );
        console.log(issueBook);
        res.send("Book Issued");
      } else {
        res.send("Book unavailable");
      }
    } else if (issue == "false") {
      console.log("redirecting");
      const r = "/book/" + isbn_no;
      console.log(r);
      res.redirect(r);
    } else {
      console.log("invalid issue value");
      res.send("Invalid query string value");
    }
  } catch (e) {
    console.log(e);
    res.send("Something went wrong!");
  }
});

//listens to port 3000
app.listen(port, function () {
  console.log(`Server is up ${port}`);
});
