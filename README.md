# tracker-app
Smart film &amp; book tracker with AI recommendations

fixes:
no same email
check multiple genres
edit item

try to add: 
recs based on planning list
movie/book db

Useful postgresql commands:

-- See all tables
\dt

-- See columns of a table
\d users
\d items

-- See all users (without passwords)
SELECT id, username, email FROM users;

-- See all items
SELECT * FROM items;

-- See items for a specific user
SELECT * FROM items WHERE user_id = 1;

-- See items ordered by rating
SELECT title, type, rating FROM items ORDER BY rating DESC;

-- Count items per genre
SELECT genre, COUNT(*) FROM items GROUP BY genre;

-- Exit
\q
