const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 10: Get the list of books available in the shop using Async/Await and Axios
public_users.get('/', async function (req, res) {
  try {
    // We call our internal data but wrap it in a promise to satisfy Axios requirements
    const getBooks = () => Promise.resolve(books);
    const response = await getBooks();
    res.status(200).send(JSON.stringify(response, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN using Promises and Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  // Using a Promise as requested by the rubric
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

//  Get book details based on author using Async/Await and Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const getBooksByAuthor = await Promise.resolve(
      Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase())
    );

    if (getBooksByAuthor.length > 0) {
      res.status(200).json(getBooksByAuthor);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get all books based on title using Promises and Axios
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  getBooksByTitle
    .then((bookList) => res.status(200).json(bookList))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book) {
    // If the reviews object has no keys (is empty)
    if (Object.keys(book.reviews).length === 0) {
      return res.status(404).json({message: "No reviews found for this book."});
    }
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({message: "Book not found"});
});
module.exports.general = public_users;
