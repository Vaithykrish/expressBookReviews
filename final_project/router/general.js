const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users; // Import the shared array
const public_users = express.Router();

// Register
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        if (users.some(u => u.username === username)) {
            return res.status(404).json({ message: "User already exists!" });
        }
        users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Async/Await & Promises
public_users.get('/', async (req, res) => {
    res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
        if (books[isbn]) resolve(books[isbn]);
        else reject("Book not found");
    }).then(book => res.send(JSON.stringify(book, null, 4)))
      .catch(err => res.status(404).send(err));
});

public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    const filtered = Object.values(books).filter(b => b.author === author);
    res.send(JSON.stringify(filtered, null, 4));
});

public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    const filtered = Object.values(books).filter(b => b.title === title);
    res.send(JSON.stringify(filtered, null, 4));
});

module.exports.general = public_users;
