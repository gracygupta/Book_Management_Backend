//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const Book = require("./models/books");
const port = process.env.PORT || 8080;

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
    console.log(page + " " + limit);
    if (page == undefined || limit == undefined) {
      console.log("hvjac");
      const result = booksData;
      res.render("add_show", { books: result });
    } else {
      page = parseInt(req.query.page);
      limit = parseInt(req.query.limit);
      let c = (page - 1) * limit;
      sliced = booksData.slice(c, c + limit);
      res.render("add_show", { books: sliced });
    }
  } catch (e) {
    res.send(e);
  }
});

//create new book record
app.post("/books", async (req, res) => {
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
          var message_1 = "OOPS!";
          var message_2 = "Book number already exist.";
        } else {
          if (inventory < 0) {
            var message_1 = "OOPS!";
            var message_2 = "Inventory Invalid!! (Must be greater than 0)";
          }
        }
        console.log(err);
        res.render("delete", {
          message_1: message_1,
          message_2: message_2,
          brace: "(",
        });
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
    var message_1 = "";
    var message_2 = "";
    var brace = "";
    bookDel
      .then(() => {
        console.log("All records deleted");
        message_1 = "Success";
        message_2 = "All Book Records Deleted";
        brace = ")";
        res.render("delete", {
          message_1: message_1,
          message_2: message_2,
          brace: brace,
        });
      })
      .catch((e) => {
        console.log(e);
        message_1 = "Oops!";
        message_2 = "Error in deletion ";
        brace = "(";
        res.render("delete", {
          message_1: message_1,
          message_2: message_2,
          brace: brace,
        });
      });
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

//returns books having value less than n in inventory
app.get("/books/find_books_needed", async (req, res) => {
  var message_1 = "";
  var message_2 = "";
  const n = req.query.n;
  console.log("Value of n = " + n);
  if (n === undefined) {
    message_1 = "OOPS!";
    message_2 = "'n' not defined";
    brace = "(";
    console.log("n not specified");
    res.render("delete", {
      message_1: message_1,
      message_2: message_2,
      brace: brace,
    });
  } else {
    const booksData = await Book.find({ inventory: { $lt: n } });
    result = booksData;
    console.log("Data retrieved");
    res.render("show", { books: result });
  }
});

//returns all books with inventory 0
app.get("/books/unavailable_books", async (req, res) => {
  const booksData = await Book.find({ inventory: 0 });
  console.log("Required Books\n" + booksData);
  res.render("show", { books: booksData });
});

//handling get error when params are missing
app.get("/book", function (req, res) {
  var message_1 = "ERROR 404";
  var message_2 = "Check URL";
  res.render("delete", {
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
      console.log(message_2);
    } else {
      console.log("Data retrieved");
    }
    res.render("show", { books: bookData });
  } catch (e) {
    console.log(e);
    var message_1 = "OOPS!";
    var message_2 = "Something went wrong";
    res.render("delete", {
      message_1: message_1,
      message_2: message_2,
      brace: "(",
    });
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
