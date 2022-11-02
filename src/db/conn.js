const mongoose = require("mongoose");
const conn_str =
  "mongodb+srv://gracygupta04:Nilesh2502@books.fd3ppny.mongodb.net/booksManage?retryWrites=true&w=majority";

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
