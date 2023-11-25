
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
// Parse JSON bodies (as sent by the client)
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 1337;

const corsOptions = {
    origin: 'http://localhost:1337',
    credentials: true  // Enable credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));

const session = require('express-session');

// MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Jayesh',
    password: 'Jayesh@2001',
    database: 'myapp' // Your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname)));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    res.sendFile(filePath);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server Error');
            return;
        }
        if (results.length > 0) {
            // Store the logged-in user's username in the session
            req.session.username = username;
            res.redirect('/Dashboard.html');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});


app.post('/signup', (req, res) => {
    const { signupUsername, signupPassword, confirmPassword } = req.body;

    if (signupPassword !== confirmPassword) {
        res.status(400).send('Passwords do not match');
        return;
    }

    const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(insertQuery, [signupUsername, signupPassword], (error, results) => {
        if (error) {
            res.status(500).send('Error signing up');
            console.error('Error signing up:', error);
        } else {
            res.send('Signed up successfully! Proceed to login.');
        }
    });
});
app.get('/teammates-birthdays', (req, res) => {
    const query = 'SELECT username, DATE_FORMAT(BirthDate, "%Y-%m-%d") AS BirthDate FROM users_birthdays';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server Error');
            return;
        }
        res.json(results); // Send the fetched data as JSON response
    });
});

app.get('/getLoggedInUsername', (req, res) => {
    const loggedInUsername = req.session.username; // Assuming the username is stored in the session
    if (loggedInUsername) {
        res.send(loggedInUsername); // Respond with the logged-in username
    } else {
        res.status(401).send('User not logged in');
    }
});

//app.get('/usernames', (req, res) => {
  //  const query = 'SELECT id, username FROM users';
  //  connection.query(query, (err, results) => {
  //      if (err) {
  //          res.status(500).send('Server Error');
//return;
     //   }
  //      res.json(results); // Send the fetched usernames as JSON response
  //  });
//});

app.get('/birthday/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log('UserID:', userId);
    const query = `SELECT BirthDate FROM users_birthdays WHERE users_id=${req.session.username}`;
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Server Error');
            return;
        }
        if (results.length > 0) {
            res.json(results[0].BirthDate); // Send the fetched birthdate as JSON response
        } else {
            res.json(null); // Send null if no birthday found for the user
        }
    });
});

app.post('/update-user-info', (req, res) => {
    const { name, mobile, birthdate } = req.body;
    const loggedInUsername = req.session.username;

    const query = `
    UPDATE users_birthdays AS ub
    SET ub.Name_of_user = ?, ub.Mobile_No = ?, ub.BirthDate = ?
    WHERE ub.username = ?;
`;

    console.log('SQL Query:', query);
    connection.query(query, [name, mobile, birthdate, loggedInUsername], (error, results) => {
        if (error) {
            res.status(500).send('Error updating personal information');
            console.error('Error updating personal information:', error);
        } else {
            if (results.affectedRows > 0) {
                res.send('Personal information updated successfully!');
            } else {
                res.status(400).send('No user found or no change detected');
            }
        }
    });
});

app.get('/user-info', (req, res) => {
    const loggedInUsername = req.session.username;

    const query = `SELECT Name_of_user, Mobile_No, DATE_FORMAT(BirthDate, '%Y-%m-%d') AS BirthDate FROM users_birthdays WHERE username = ?`;

    connection.query(query, [loggedInUsername], (err, results) => {
        if (err) {
            res.status(500).send('Server Error');
            return;
        }
        if (results.length > 0) {
            const userInfo = results[0];
            res.json(userInfo);
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Multer setup for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Serve the HTML page with the upload form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/upload.html');
});

// Handle the image upload and database insertion
app.post('/upload', upload.single('image'), (req, res) => {
    const imageFile = req.file;

    if (!imageFile) {
        res.status(400).send('Please upload an image');
        return;
    }

    // Read the image file as binary data
    const imageBuffer = fs.readFileSync(imageFile.path);
    const loggedInUsername = req.session.username;

    // Insert the image data into the database
    connection.query(
        'UPDATE users_birthdays SET image_data = ? WHERE username = ? ', [imageBuffer, loggedInUsername], (error, results) => {
            if (error) {
                console.error('Error inserting image:', error);
                res.status(500).send('Error inserting image');
            } else {
                console.log('Image inserted successfully!');
                res.send('Image uploaded and inserted into the database');
            }
        }
    );
});


// Assuming 'app' is your Express app

// Endpoint to get the profile image based on the username
app.get('/getProfileImage', (req, res) => {
    const loggedInUsername = req.session.username; // Get the logged-in username

    // Query the database to get the image data based on the username
    connection.query('SELECT image_data FROM users_birthdays WHERE username = ?', [loggedInUsername], (error, results) => {
        if (error) {
            console.error('Error fetching profile image:', error);
            res.status(500).send('Error fetching profile image');
        } else {
            if (results.length > 0 && results[0].image_data) {
                const imageData = results[0].image_data; // Assuming the image data is retrieved as a buffer

                // Set the appropriate content type for the image
                res.writeHead(200, {
                    'Content-Type': 'image/jpeg' // Adjust content type based on your image type
                });

                // Send the image data as the response
                res.end(imageData, 'binary');
            } else {
                // If no image found, send a placeholder image or some default response
                res.status(404).send('Image not found');
            }
        }
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


