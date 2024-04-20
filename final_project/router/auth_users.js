const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const secretKey = 'izpp0jv6USBMOQp0MCWjD/o6swJEqEDqhdfdOgBHXDs='; 

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({message: "Username and password are required"});
    }
  
    // Check if the username and password match the one we have in records
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
      return res.status(401).json({message: "Invalid credentials"});
    }
  
    // Create JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  
    // Send the token to the client
    res.json({message: "Logged in successfully", token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    console.log("Accessing PUT /auth/review with ISBN:", req.params.isbn);
    const { review } = req.body;  // Capture the review from the request body
    const { isbn } = req.params;  // ISBN from the URL parameter

    console.log("Request params:", req.params);
    console.log("Request body:", req.body);

    if (!review) {
        console.log("No review provided");
        return res.status(400).json({ message: "Review text must be provided" });
    }

    // Verify and extract user info from JWT token
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is sent in the Authorization header
    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const username = decoded.username;
        console.log("Decoded JWT:", decoded);

        // Check if the book exists
        if (!books[isbn]) {
            console.log("Book not found for ISBN:", isbn);
            return res.status(404).json({ message: "Book not found" });
        }

        // Initialize the reviews object if it doesn't exist
        books[isbn].reviews = books[isbn].reviews || {};

        // Check the current review state before updating
        console.log("Current reviews for ISBN:", books[isbn].reviews);

        // Add or update the review for this user
        books[isbn].reviews[username] = review;
        console.log("Updated reviews for ISBN:", books[isbn].reviews);

        res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
    } catch (error) {
        console.log("JWT Verification Error:", error.message);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // ISBN from the URL parameter

    // Verify and extract user info from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const username = decoded.username;

        // Check if the book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the user has a review for this ISBN
        if (books[isbn].reviews && books[isbn].reviews[username]) {
            delete books[isbn].reviews[username]; // Delete the user's review
            res.status(200).json({ message: "Review deleted successfully" });
        } else {
            res.status(404).json({ message: "Review not found" });
        }
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;