const mongoose = require("mongoose");
require("dotenv").config();

const conn_str =
  process.env.DB_Host +
  "://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASSWORD +
  "@books.fd3ppny.mongodb.net/booksManage?retryWrites=true&w=majority";

mongoose.connect(
  conn_str,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
      console.log("error in connection");
    } else {
      console.log("mongodb is connected");
    }
  }
);
