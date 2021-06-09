-- Xiaoqi Long
-- The MySQL database for the store.
CREATE DATABASE IF NOT EXISTS store;

USE store;

DROP TABLE IF EXISTS postings;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS books;

-- A table that contains information of each unique book in the 
-- store
CREATE TABLE books(
  book_id SERIAL PRIMARY KEY,
  -- book title
  title VARCHAR(300) NOT NULL,
  author VARCHAR(300) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  publisher VARCHAR(300) NOT NULL,
  img_path VARCHAR(300),
  -- number of postings of this book
  quantity INT NOT NULL,
  UNIQUE (title, author)
);

-- A table that contains information of all the second-hand book 
-- postings in the store
CREATE TABLE postings(
  post_id SERIAL PRIMARY KEY,
  book_id BIGINT UNSIGNED,
  price NUMERIC(5, 2) NOT NULL,
  -- condition from 1 to 10: 1 oldest, 10 newest
  cond TINYINT NOT NULL,
  -- description of the product
  descript VARCHAR(500),
  -- check that condition is from 1 to 10
  CHECK (cond >= 1),
  CHECK (cond <= 10),
  FOREIGN KEY(book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- A table to contain information of all the new posting submissions for the 
-- admin to review
CREATE TABLE submissions(
  -- submission id
  sub_id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(300) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  publisher VARCHAR(300) NOT NULL,
  price NUMERIC(5, 2) NOT NULL,
  -- condition from 1 to 10
  cond TINYINT NOT NULL,
  -- description of the product
  descript VARCHAR(500),
  -- check that condition is from 1 to 10
  CHECK (cond >= 1),
  CHECK (cond <= 10)
);

INSERT INTO `books` VALUES
(1, 'The Catcher in the Rye', 'J.D. Salinger', 'Fiction', 'Little, Brown and Company', 'data/imgs/catcher.png', 1),
(2, 'Sons and Lovers', 'D.H. Lawrence', 'Fiction', 'Signet Classics', 'data/imgs/sons.png', 1),
(3, 'Common Sense', 'Thomas Paine', 'Philosophical Literature', 'Bantam Classic', 'data/imgs/common.png', 1),
(4, 'Heart of Darkness', 'Joseph Conrad', 'Fiction', 'Signet Classics', 'data/imgs/heart.png', 1),
(5, 'Physics', 'Aristotle', 'Philosophical Literature', 'Oxford Worlds Classics', 'data/imgs/physics.png', 1),
(6, 'The Unbearable Lightness of Being', 'Milan Kundera', 'Fiction', 'Harper Perennial Modern Classics', 'data/imgs/kundera.png', 2),
(7, 'Persuasion', 'Jane Austen', 'Fiction', 'Wordsworth Classics', 'data/imgs/persuasion.png', 1),
(8, 'The Awakening', 'Kate Chopin', 'Fiction', 'Wordsworth Classics', 'data/imgs/awakening.png', 1),
(9, 'Abstract Algebra', 'Dummit, Foote', 'Math', 'John Wiley & Sons', 'data/imgs/algebra.png', 1),
(10, 'C++ Primer Plus', 'Stephen Prata', 'Computer Science', 'Pearson', 'data/imgs/cplusplus.png', 1),
(11, 'Introduction to the Theory of Computation', 'Michael Sipser', 'Computer Science', 'Cengage Learning', 'data/imgs/sipser.png', 1),
(12, 'Introduction to Quantum Mechanics', 'David J. Griffiths', 'Physics', 'Cambridge University Press', 'data/imgs/quantum.png', 1),
(13, 'Dream of the Red Chamber', 'Cao Xueqin', 'Fiction', 'Renmin', 'data/imgs/hong.png', 1),
(14, 'Cat Breed Guide', 'Gary Weitzman', 'Reference', 'National Geography', 'data/imgs/cat.png', 1),
(15, 'Analysis', 'Terence Tao', 'Math', 'Turing', 'data/imgs/analysis.png', 1);

INSERT INTO `postings` VALUES
(1, 2, 5.99, 5, 'Notes on page 12'),
(2, 1, 8.99, 5, 'Marks on cover'),
(3, 3, 12.23, 9, ''),
(4, 4, 10.00, 8, ''),
(5, 5, 999.99, 1, 'The original manuscript!'),
(6, 6, 10.00, 9, ''),
(7, 6, 5.00, 5, ''),
(8, 7, 5.00, 5, 'coffee stains'),
(9, 8, 5.00, 5, 'tear stains'),
(10, 9, 10.00, 4, 'I did all the exercises'),
(11, 10, 10.00, 5, ''),
(12, 11, 200.00, 10, ''),
(13, 12, 5.00, 2, 'Cat drawings everywhere'),
(14, 13, 5.00, 8, 'Not in English'),
(15, 14, 19.99, 7, ''),
(16, 15, 6.99, 9, '');

INSERT INTO submissions VALUES
(1, 'Foo', 'Bar', 'Fiction', 'Baz', 10.00, 8, 'A book');