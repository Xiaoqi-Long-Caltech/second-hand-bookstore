"use strict";
/**
 * @author Xiaoqi Long
 * CS101 Spring 2021
 * Back end code that implements the API for the second-hand online bookstore
 * 
 * This API supports the following endpoints:
 * GET /posting/all
 * GET /book/filter
 * GET /posting/:id
 * GET /book/filter/:genre
 * GET /submissions
 *
 * POST /purchase
 * POST /submission
 * POST /add
 * POST /del
 */

const express = require("express");
const fs = require("fs/promises");
const app = express();
const multer = require("multer");
const mysql = require("promise-mysql");

// To handle different POST formats
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(multer().none());

const DEBUG = true;
const SERVER_ERROR = "Something went wrong on the server... Please try again later.";
const DEFAULT_IMAGE = 'data/imgs/default.png';

app.use(express.static("public"));

// GET endpoints

/**
 * Provides an array of JSON of all the postings' information, including the 
 * information of the books.
 * Each JSON response contains the title, author, genre, publisher, condition,
 * additional notes, price, and the book id and posting id of the posting.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/posting/all", async function(req, res, next) {
  let qry = "SELECT * FROM postings INNER JOIN books ON postings.book_id = books.book_id;";
  try {
    let result = await queryDB(qry);
    res.type("json");
    res.send(result);
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    return next(err);
  }
});

/**
 * Provides an array of JSON of all the genres available for filter options
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/book/filter", async (req, res, next) => {
  try {
      let genres = await fs.readFile("genres.txt", "utf8");
      res.json(genres.split("\n"));
  }
  catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    return next(err);
  }
})

/**
 * Provides an array of JSON of all the postings' information of a specified post id
 * Input parameter: post id of the posting (integer)
 * Returns a 500 error if something goes wrong on the server
 * Returns a 404 error if the id is not associated with a posting.
 */
app.get("/posting/:id", async function(req, res, next) {
  let id = req.params.id;
  let qry = "WITH post AS" +
            "(SELECT * FROM postings" +
            " WHERE post_id = ?)" +
            "SELECT *" +
            "FROM post NATURAL JOIN books;";
  try {
    let result = await queryDB(qry, [id]);
    res.type("json");
    res.send(result);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.status(404);
      err.message("No results found.");
    }
    else {
      res.status(500);
      err.message = SERVER_ERROR;
    }
    return next(err);
  }
});

/**
 * Provides an array of JSON of all the postings' information of books of
 * a specified genre
 * Input parameter: genre (string) (one of the genres from the genre.txt file)
 * Returns a 500 error if something goes wrong on the server
 * Returns a 404 error if this genre does not exist on the server
 */
app.get("/book/filter/:genre", async function(req, res, next) {
  let genre = req.params.genre;
  let qry = "WITH book AS" +
            "(SELECT * FROM books" +
            " WHERE genre = ?)" +
            "SELECT *" +
            "FROM postings NATURAL JOIN book;";
  try {
    let result = await queryDB(qry, [genre]);
    res.type("json");
    res.send(result);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.status(404);
      err.message("No results found.");
    }
    else {
      res.status(500);
      err.message = SERVER_ERROR;
    }
    return next(err);
  }
});

/**
 * Provides an array of json of all the submitted postings' information
 * Each JSON object contains the title, author, genre, price, condition,
 * publisher, and additional notes of the book to be posted.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/submissions", async function(req, res, next) {
  let qry = "SELECT * FROM submissions;";
  try {
    let result = await queryDB(qry);
    res.type("json");
    res.send(result);
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    return next(err);
  }
});

// POST endpoints

/**
 * Simulates a purchase. Deletes a posting from the postings table 
 * and decrements the book count in the books table by 1. Sends a message
 * if successful.
 * Returns a 500 error if something goes wrong on the server.
 */
app.post("/purchase", async function(req, res, next) {
  let post_id = req.body.postid;
  try {
    let book_id = await findBook(post_id);
    // decrements the book count by 1
    let qry1 = "UPDATE books SET quantity = quantity - 1 " +
               "WHERE book_id = ?;";
    await queryDB(qry1, [book_id]);
    // deletes the posting
    let qry2 = "DELETE FROM postings WHERE post_id = ?;";
    await queryDB(qry2, [post_id]);
    res.type("text");
    res.send("Successfully updated tables");
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    return next(err);
  }
});

/**
 * Enters the information into the submissions table for a new posting
 * for the admin to review.
 * Returns a 500 error if something goes wrong on the server.
 */
app.post("/submission", async function(req, res, next) {
  let title = req.body.title;
  let author = req.body.author;
  let genre = req.body.genre;
  let price = req.body.price;
  let cond = req.body.condition;
  let publisher = req.body.publisher;
  let descript = req.body.description;
  try {
    let qry = "INSERT INTO submissions(title, author, genre, publisher, price, cond, descript)" +
              "VALUES (?, ?, ?, ?, ?, ?, ?);";
    await queryDB(qry, [title, author, genre, publisher, price, cond, descript]);
    res.type("text");
    res.send("The posting is successfully submitted for review");
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    return next(err);
  }
})

/**
 * Enters the information for a new posting, after an admin approves it.
 * Input parameter: sub_id, the id for the submission of the new posting.
 * Returns a 500 error if something goes wrong on the server.
 */
app.post("/add", async function(req, res, next) {
  let sub_id = req.body.subid;
  try {
    let submission = await findSubmission(sub_id);
    let title = submission.title;
    let author = submission.author;
    let genre = submission.genre;
    let publisher = submission.publisher;
    let price = submission.price;
    let cond = submission.cond;
    let descript = submission.descript;
    // checks if the book is already in the books table
    let notListed = await checkBook(title, author);
    if (notListed) {
      // if not listed, insert new book
      let img_path = DEFAULT_IMAGE;
      let qry1 = "INSERT INTO books(title, author, genre, publisher, img_path, quantity)" +
                 "VALUES (?, ?, ?, ?, ?, 1);";
      await queryDB(qry1, [title, author, genre, publisher, img_path]);
    } else {
      // if listed, increment the stock by 1
      let bookId = await getBookid(title, author);
      let qry2 = "UPDATE books SET quantity = quantity + 1 " +
                 "WHERE book_id = ?;"
      await queryDB(qry2, [bookId]);
    }
    // insert the posting information into the posting table
    let bookId = await getBookid(title, author);
    let qry3 = "INSERT INTO postings(book_id, price, cond, descript)" +
               "VALUES (?, ?, ?, ?);";
    await queryDB(qry3, [bookId, price, cond, descript]);
    // delete the row from the submissions table
    await deleteSub(sub_id);
    res.type("text");
    res.send("This submission is entered as a public posting");
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    return next(err);
  }
});

/**
 * Deletes the information of a submission for a posting from the submissions
 * table.
 * Input parameter: sub_id, the id for the submission of the new posting.
 * Returns a 500 error if something goes wrong on the server.
 */
app.post("/del", async function(req, res, next) {
  let sub_id = req.body.subid;
  try {
    await deleteSub(sub_id);
    res.type("text");
    res.send("This submission is successfully removed");
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    return next(err);
  }
});

// Helper functions for the GET and POST endpoints 

/**
 * Helper function that finds the book id associated with a posting from
 * the postings table.
 * @param {Integer} post_id -- post id of the posting
 * @return {Integer} -- book id of the associated book
 */
async function findBook(post_id) {
  let qry = "SELECT book_id FROM postings " + 
            "WHERE post_id = ?;";
  try {
    let result = await queryDB(qry, [post_id]);
    return result[0].book_id;
  } catch(err) {
    throw err;
  }
}

/**
 * Helper function that finds the submission info given the submission id from
 * the submissions table.
 * @param {Integer} sub_id -- sub id of the submission
 * @return {RowDataPacket} -- row from the SQL table with information about the
 * submission (title, author, genre, condition, price, publisher, notes)
 */
async function findSubmission(sub_id) {
  let qry = "SELECT * FROM submissions " + 
            "WHERE sub_id = ?;";
  try {
    let result = await queryDB(qry, [sub_id]);
    return result[0];
  } catch(err) {
    throw err;
  }
}

/**
 * Helper function that deletes a row of submission from the submissions table
 * @param {Integer} id -- sub id of the submission
 */
async function deleteSub(id) {
  try {
    let qry = "DELETE FROM submissions WHERE sub_id = ?;";
    await queryDB(qry, [id]);
  } catch (err) {
    throw err;
  }
}

/**
 * Helper function that checks if a book already exists in the books table
 * @param {String} title -- the title of the book
 * @param {String} author -- the author of the book 
 * @return {boolean} -- if the book already exists, return false. Otherwise, return
 * true.
 */
async function checkBook(title, author) {
  let qry = "SELECT title, author FROM books ;";
  let result = await queryDB(qry);
  for (let i = 0; i < result.length; i++) {
    if (result[i].title === title && result[i].author === author) {
      return false;
    }
  }
  return true;
}

/**
 * Helper function that retrieves the book id of a given book from the books 
 * table
 * @param {String} title -- the title of the book
 * @param {String} author -- the author of the book 
 * @return {Integer} -- the id of the book
 */
async function getBookid(title, author) {
  let qry = "SELECT book_id FROM books " + 
            "WHERE title = ? AND author = ?";
  try {
    let result = await queryDB(qry, [title, author]);
    return result[0].book_id;
  } catch(err) {
    throw err;
  }
}

/**
 * Establishes a database connection to the store db and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDB() {
  let db = await mysql.createConnection({
    // Variables for connections to the database.
    socketPath: "/tmp/mysql.sock",         
    user: "root",         
    password: "password",    
    database: "store"    
  });
  return db;
}

/**
 * Helper function to query the database with the given query input.
 * @param {String} qry -- The query body
 * @param {String} param -- (optional) The parameters to retrieve certain information
 * @returns {Object} -- The result of the query
 */
async function queryDB(qry, param) {
  let db;
  let row;
  try {
    db = await getDB();
    if (param !== "") {
      row = await db.query(qry, param);
    } else {
      row = await db.query(qry);
    }
    db.end();
    return row;
  } catch (err) {
    if (db) {
      db.end();
    }
    throw err;
  }
}

/**
 * Error-handling middleware to cleanly handle different types of errors.
 * Any function that calls next with an Error object will hit this error-handling
 * middleware since it's defined with app.use at the end of the middleware stack.
 */
 function errorHandler(err, req, res, next) {
  if (DEBUG) {
    console.error(err);
  }
  // All error responses are plain/text 
  res.type("text");
  res.send(err.message);
}

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT);