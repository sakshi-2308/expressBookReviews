const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      // Check if username or password is not provided
      return res.status(400).json({message: "Username and password are required"});
    }
  
    // Check if username already exists in the users array
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({message: "Username already exists"});
    }
  
    // Add the new user to the users array
    users.push({ username, password });
    res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Simulating async operation using Promise that immediately resolves with books
        const fetchBooks = () => new Promise(resolve => setTimeout(() => resolve(books), 100));

        // Await the simulated fetch operation
        const booksData = await fetchBooks();
        res.status(200).json(booksData);
    } catch (error) {
        console.error('Failed to fetch books:', error);
        res.status(500).json({ message: 'Failed to fetch books' });
    }
});

async function fetchBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        }, 100);
    });
}

public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;
    try {
        const bookDetails = await fetchBookByISBN(isbn);
        res.status(200).json(bookDetails);
    } catch (error) {
        console.error('Failed to fetch book:', error);
        res.status(404).json({ message: error });
    }
});
  
async function fetchBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
            if (foundBooks.length > 0) {
                resolve(foundBooks);
            } else {
                reject("No books found by that author");
            }
        }, 100); // simulate delay
    });
}

public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params;
    try {
        const bookDetails = await fetchBooksByAuthor(author);
        res.status(200).json(bookDetails);
    } catch (error) {
        console.error('Failed to fetch books:', error);
        res.status(404).json({ message: error });
    }
});

async function fetchBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
            if (foundBooks.length > 0) {
                resolve(foundBooks);
            } else {
                reject("No books found with that title");
            }
        }, 100); // simulate delay
    });
}

public_users.get('/title/:title', async function (req, res) {
    const { title } = req.params;
    try {
        const bookDetails = await fetchBooksByTitle(title);
        res.status(200).json(bookDetails);
    } catch (error) {
        console.error('Failed to fetch books:', error);
        res.status(404).json({ message: error });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
  const book = books[isbn]; // Fetch the book from the books object using the ISBN
  if (book) {
    if (Object.keys(book.reviews).length) {
      res.status(200).json(book.reviews); // Send the book reviews as a response if any
    } else {
      res.status(404).json({message: "No reviews found for this book"}); // Send a 404 error if no reviews are found
    }
  } else {
    res.status(404).json({message: "Book not found"}); // Send a 404 error if the book is not found
  }
});

module.exports.general = public_users;
