//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const Book = require("./models/books");
const port = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.render("home");
});

//shows all books record
app.get("/books", async (req, res) => {
  var page = req.query.page;
  var limit = req.query.limit;
  try {
    const booksData = await Book.find();
    let sliced = [];
    if (page == undefined || limit == undefined) {
      const result = booksData;
      console.log("Data Received \n" + result);
      res.render("add_show", { books: result });
    } else {
      page = parseInt(req.query.page);
      limit = parseInt(req.query.limit);
      let c = (page - 1) * limit;
      sliced = booksData.slice(c, c + limit);
      console.log("Data Received \n" + sliced);
      res.render("add_show", { books: sliced });
    }
  } catch (e) {
    res.send(e);
    var message_1 = "Oops!";
    var message_2 = "Something went wrong";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  }
});

//create new book record
app.post("/books", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
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
        console.log("Book Record Added.");
        res.redirect("/books");
      })
      .catch(async (err) => {
        console.log(res.statusCode);
        const book = await Book.find({ isbn_no: bn_no });
        if (book.length != 0) {
          message_1 = "OOPS!";
          message_2 = "Book number already exist.";
        } else {
          if (inventory < 0) {
            message_1 = "OOPS!";
            message_2 = "Inventory Invalid!! (Must be greater than 0)";
          }
        }
        console.log(err);
        res.render("error", {
          message_1: message_1,
          message_2: message_2,
          brace: "(",
        });
      });
  } catch (e) {
    console.log(e);
    message_1 = "Oops!";
    message_2 = "Something went wrong";
    brace = "(";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: brace,
    });
  }
});

//delete all books records
app.delete("/books", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
  try {
    const bookDel = Book.deleteMany({});

    bookDel
      .then(() => {
        console.log("All records deleted");
        message_1 = "All Book Records Deleted";
        res.render("success", {
          message: message_1,
        });
      })
      .catch((e) => {
        console.log(e);
        message_1 = "Oops!";
        message_2 = "Error in deletion ";
        res.render("error", {
          message_1: message_1,
          message_2: message_2,
          brace: "(",
        });
      });
  } catch (e) {
    message_1 = "Oops!";
    message_2 = "Error in deletion ";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  }
});

//returns books having value less than n in inventory
app.get("/books/find_books_needed", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
  const n = req.query.n;
  if (n === undefined) {
    message_1 = "OOPS!";
    message_2 = "'n' not defined";
    console.log("n not specified");
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  } else {
    const booksData = await Book.find({ inventory: { $lt: n } });
    if (booksData.length != 0) {
      console.log("Data retrieved");
    } else {
      console.log("No book found");
    }
    res.render("show", { books: booksData });
  }
});

//returns all books with inventory 0
app.get("/books/unavailable_books", async (req, res) => {
  const booksData = await Book.find({ inventory: 0 });
  if (booksData.length != 0) {
    console.log("Required Books\n" + booksData);
  } else {
    console.log("No book found");
  }
  res.render("show", { books: booksData });
});

//handling get error when params are missing
app.get("/book", function (req, res) {
  var message_1 = "ERROR 404";
  var message_2 = "Check URL";
  res.render("error", {
    message_1: message_1,
    message_2: message_2,
    brace: "(",
  });
});

//fetch records of particular book
app.get("/book/:isbn_no", async (req, res) => {
  try {
    const isbn_no = req.params.isbn_no;
    const bookData = await Book.find({ isbn_no: isbn_no });
    if (bookData.length === 0) {
      console.log("Book not find");
    } else {
      console.log("Data retrieved\n" + bookData);
    }
    res.render("show", { books: bookData });
  } catch (e) {
    console.log(e);
    var message_1 = "OOPS!";
    var message_2 = "Something went wrong";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  }
});

//replace records of a book with aother book record
app.put("/book/:from_isbn_no", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
  try {
    const from_isbn_no = parseInt(req.params.from_isbn_no);
    const name = req.query.name;
    const genre = req.query.genre;
    const author = req.query.author;
    const to_isbn_no = parseInt(req.query.to_isbn_no);
    const inventory = parseInt(req.query.inventory);
    if (
      name == undefined ||
      genre == undefined ||
      to_isbn_no == undefined ||
      author == undefined ||
      inventory == undefined
    ) {
      console.log("Some fields undefined");
      message_1 = "OOPS!";
      message_2 = "Require all fields";
      res.render("error", {
        message_1: message_1,
        message_2: message_2,
        brace: "(",
      });
    } else {
      const book = Book.find({ isbn_no: from_isbn_no });
      if (book.length != 0) {
        console.log("Previous Record:\n" + book);
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
        message_1 = "Book Updated";
        res.render("success", { message: message_1 });
        console.log(
          message_1 +
            ":\n" +
            "{isbn_no:" +
            to_isbn_no +
            "\nname:" +
            name +
            "\ngenre:" +
            genre +
            "\nauthor_name:" +
            author +
            "\ninventory:" +
            inventory +
            "\n}"
        );
      } else {
        message_1 = "OOPS!";
        message_2 = "Book not Exist";
        res.render("error", {
          message_1: message_1,
          message_2: message_2,
          brace: "(",
        });
      }
    }
  } catch (e) {
    console.log(e);
    message_1 = "OOPS!";
    message_2 = "Something went wrong";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  }
});

//update some fields off a book record
app.patch("/book/:isbn_no", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
  try {
    const isbn_no = req.params.isbn_no;
    const bookData = await Book.find({ isbn_no: isbn_no });
    if (bookData.length != 0) {
    const to_isbn_no = req.query.to_isbn_no;
      const name = req.query.name || bookData[0].name;
      const author = req.query.author || bookData[0].author_name;
      const genre = req.query.genre || bookData[0].genre;
      const inventory = parseInt(req.query.inventory || bookData[0].inventory);
      const bookUpdate = await Book.updateOne(
        { isbn_no: isbn_no },
        { isbn_no: to_isbn_no ,name: name, author_name: author, genre: genre, inventory: inventory }
      );
      console.log(bookUpdate);
      message_1 = "Book record modified";
      res.render("success", { message: message_1 });
    } else {
      message_1 = "Sorry";
      message_2 = "Book not find";
      res.render("error", {
        message_1: message_1,
        message_2: message_2,
        brace: "(",
      });
    }
  } catch (e) {
    console.log(e);
    message_1 = "OOPS!";
    message_2 = "Something went wrong";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  }
});

//delete record of a book
app.delete("/book/:isbn_no", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
  try {
    var result = "";
    const isbn_no = req.params.isbn_no;
    if (isbn_no) {
      const book = await Book.find({ isbn_no: isbn_no });
      console.log(book);
      if (book.length == 0) {
        message_1 = "OOPS!";
        message_2 = "Book not Exist";
        res.render("error", {
          message_1: message_1,
          message_2: message_2,
          brace: "(",
        });
      } else {
        const bookDelete = await Book.deleteOne({ isbn_no: isbn_no });
        result = "Book deleted";
        res.render("success", { message: result });
      }
    } else {
      result = "isbn_no missing";
      res.render("success", { message: result });
    }
    res.send(result);
  } catch (e) {
    message_1 = "OOPS!";
    message_2 = "Something went wrong";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  }
});

//issue book: decrease inventory
app.get("/book/:isbn_no/:issue", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
  try {
    var result = "";
    const isbn_no = req.params.isbn_no;
    const issue = req.params.issue.toLowerCase();
    const book = await Book.find({ isbn_no: isbn_no });
    console.log(book);
    if (book.length != 0) {
      if (issue == "true") {
        if (book[0].inventory > 0) {
          const inventory = book[0].inventory - 1;
          const issueBook = await Book.updateOne(
            { isbn_no: isbn_no },
            { inventory: inventory }
          );
          console.log(issueBook);
          message_1 = "Book Issued";
          res.render("success", { message: message_1 });
        } else {
          message_1 = "Sorry!";
          message_2 = "Book unavailable";
          res.render("error", {
            message_1: message_1,
            message_2: message_2,
            brace: "(",
          });
        }
      } else if (issue == "false") {
        console.log("issue is false");
        res.redirect("books");
      } else {
        console.log("invalid issue value");
        message_1 = "OOPS!";
        message_2 = "Invalid 'issue' value";
        res.render("error", {
          message_1: message_1,
          message_2: message_2,
          brace: "(",
        });
      }
    }
  } catch (e) {
    console.log(e);
    message_1 = "OOPS!";
    message_2 = "Something went wrong";
    res.render("error", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
  }
});

//listens to port
app.listen(port, function () {
  console.log(`Server is up at ${port}`);
});
