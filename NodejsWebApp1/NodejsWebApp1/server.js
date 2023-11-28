/*
const express = require('express');
const path = require('path');
//const mysql = require('mysql2');
const oracledb = require('oracledb');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
// Parse JSON bodies (as sent by the client)
app.use(express.json());
app.use(cors());


app.use(cors(corsOptions));

const session = require('express-session');

// MySQL database connection
const dbConfig = {
    user: 'iqms',
    password: 'iqms',
    connectString: 'dwpd02244:1521/IQORA' // Replace with your connection string
};

let connection;
async function run() {
   

    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log('Connected to Oracle Database');

        // Your code for executing queries or operations goes here

    } catch (err) {
        console.error('Error connecting to Oracle Database:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection to Oracle Database closed');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

run();

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

app.post('/update-user-info/:username', async (req, res) => {
    const { name, mobile, birthdate } = req.body;
    const { username } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = `
            UPDATE users_information
            SET Name = :name, MobileNo = :mobile, BirthDate = TO_DATE(:birthdate, 'YYYY-MM-DD')
            WHERE username = :username
        `;

        const binds = {
            name,
            mobile,
            birthdate,
            username,
        };

        const result = await connection.execute(query, binds, { autoCommit: true });
        await connection.close();

        if (result.rowsAffected > 0) {
            res.send('Personal information updated successfully!');
        } else {
            res.status(400).send('No user found or no change detected');
        }
    } catch (error) {
        console.error('Error updating personal information:', error);
        res.status(500).send('Error updating personal information');
    }
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


//app.listen(port, () => {
//    console.log(`Server running at http://localhost:${port}/`);
//});


*/


const express = require('express');
const path = require('path');
const oracledb = require('oracledb');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
//const OracleSession = require('express-oracle-session')(session);
const app = express();
const corsOptions = {
    origin: 'http://localhost:1337',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname)));

/*
const sessionOptions = {
    // Oracle DB configuration
    store: new OracleSession({
        // Oracle configuration options
        user: 'iqms',
        password: 'iqms',
        connectString: 'dwpd02244:1521/IQORA', // Replace with your Oracle connection string
        table: 'sessions' // Table name to store sessions
    }),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
};

app.use(session(sessionOptions));
*/

const dbConfig = {
    user: 'iqms',
    password: 'iqms',
    connectString: 'dwpd02244:1521/IQORA'
};

let connection;

async function connectToDatabase() {
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log('Connected to Oracle Database');
    } catch (err) {
        console.error('Error connecting to Oracle Database:', err);
    }
}

connectToDatabase();




// Handle user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
        const result = await connection.execute(query);
        if (result.rows.length > 0) {
            req.session.username = username;
            // Redirect to Dashboard.html with the username as a query parameter
            res.redirect(`/Dashboard.html?username=${username}`);
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server Error');
    }
});

app.post('/signup', async (req, res) => {
    const { signupUsername, signupPassword, confirmPassword } = req.body;

    if (signupPassword !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const insertQuery = `INSERT INTO users (username, password) VALUES (:signupUsername, :signupPassword)`;
        const binds = {
            signupUsername,
            signupPassword
        };

        const options = {
            autoCommit: true // Assuming auto-commit is desired after the insert operation
        };

        const result = await connection.execute(insertQuery, binds, options);
        await connection.close();

        res.send('Signed up successfully! Proceed to login.');
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Error signing up');
    }
});


app.get('/teammates-birthdays', async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = 'SELECT USERNAME, TO_CHAR(BIRTHDATE, \'YYYY-MM-DD\') AS BIRTHDATE FROM users_information';

        const result = await connection.execute(query);

        await connection.close();

        const formattedResult = result.rows.map(row => ({
            USERNAME: row[0], // Assuming USERNAME is the first column in the query result
            BIRTHDATE: row[1] // Assuming BIRTHDATE is the second column in the query result
        }));
        res.json(formattedResult); // Send the fetched data as JSON response
    } catch (error) {
        console.error('Error fetching birthdays:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/user-info/:username', async (req, res) => {
    const { username } = req.params; // Get the username from the route parameter


    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = `SELECT Name, MobileNo, TO_CHAR(BirthDate, 'YYYY-MM-DD') AS BirthDate FROM users_information WHERE username = :username`;

        const result = await connection.execute(query, { username });
        await connection.close();

        if (result.rows.length > 0) {
            const userInfo = {
                Name: result.rows[0][0],
                MobileNo: result.rows[0][1],
                BirthDate: result.rows[0][2]
            };
            res.json(userInfo);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).send('Server Error');
    }
});


app.post('/update-user-info/:username', async (req, res) => {
    const { name, mobile, birthdate } = req.body;
    const { username } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = `
            UPDATE users_information
            SET Name = :name, MobileNo = :mobile, BirthDate = TO_DATE(:birthdate, 'YYYY-MM-DD')
            WHERE username = :username
        `;

        const binds = {
            name,
            mobile,
            birthdate,
            username,
        };

        const result = await connection.execute(query, binds, { autoCommit: true });
        await connection.close();

        if (result.rowsAffected > 0) {
            res.send('Personal information updated successfully!');
        } else {
            res.status(400).send('No user found or no change detected');
        }
    } catch (error) {
        console.error('Error updating personal information:', error);
        res.status(500).send('Error updating personal information');
    }
});


app.post('/upload', upload.single('image'), async (req, res) => {
    const imageFile = req.file;

    if (!imageFile) {
        res.status(400).send('Please upload an image');
        return;
    }

    try {
        const imageBuffer = fs.readFileSync(imageFile.path);
        const loggedInUsername = req.session.username;

        const connection = await oracledb.getConnection(dbConfig);

        const query = `
            UPDATE users_information
            SET profile_image = :imageBuffer
            WHERE username = :loggedInUsername
        `;

        const binds = {
            imageBuffer,
            loggedInUsername,
        };

        const result = await connection.execute(query, binds, { autoCommit: true });
        await connection.close();

        console.log('Image inserted successfully!');
        res.send('Image uploaded and inserted into the database');
    } catch (error) {
        console.error('Error inserting image:', error);
        res.status(500).send('Error inserting image');
    }
});




app.get('/getProfileImage/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = 'SELECT profile_image FROM users_information WHERE username = :username';

        const result = await connection.execute(query, { username });

        if (result.rows.length > 0 && result.rows[0].PROFILE_IMAGE) {
            const imageData = result.rows[0].PROFILE_IMAGE;

            if (imageData) {
                const contentType = 'image/jpeg'; // Set the content type based on your image type

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Length': imageData.length
                });

                res.end(imageData, 'binary');
            } else {
                res.status(404).send('Image data not found or empty');
            }
        } else {
            res.status(404).send('Image not found');
        }

        await connection.close();
    } catch (error) {
        console.error('Error fetching profile image:', error);
        res.status(500).send('Error fetching profile image');
    }
});



app.get('/fetchData', async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT username, name, mobileno
            FROM users_information
        `;

        const result = await connection.execute(query);
        await connection.close();

        const rows = result.rows.map(row => ({
            USERNAME: row[0],
            NAME: row[1],
            MOBILENO: row[2]
        }));

        res.json(rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/fetchName/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT Name
            FROM users_information
            WHERE username = :username
        `;

        const binds = [username];
        const result = await connection.execute(query, binds);

        await connection.close();

        if (result.rows.length > 0) {
            res.json({ name: result.rows[0][0] });
        } else {
            res.status(404).send('Name not found for the given username');
        }
    } catch (error) {
        console.error('Error fetching name:', error);
        res.status(500).send('Error fetching name');
    }
});

app.get('/fetchBirthdayPersons', async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT username, Name
            FROM users_information
        `;

        const result = await connection.execute(query);
        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching birthday persons:', error);
        res.status(500).send('Error fetching birthday persons');
    }
});


app.post('/saveContribution', async (req, res) => {
    const { username, name, selectedPerson, amount, note } = req.body;

    try {
        // Oracle DB connection
        const connection = await oracledb.getConnection(dbConfig);

        // Prepare SQL statement
        const sql = `
      INSERT INTO Birthday_Contribution (username, Name, BirthDay_Person, Amount, Note) 
      VALUES (:username, :name, :selectedPerson, :amount, :note)
    `;

        const binds = { username, name, selectedPerson, amount, note };

        // Execute SQL statement
        const result = await connection.execute(sql, binds, { autoCommit: true });

        console.log('Contribution saved successfully!');
        res.status(200).send('Contribution saved successfully!');
    } catch (error) {
        console.error('Error saving contribution:', error);
        res.status(500).send('Failed to save contribution');
    }
});

/*

app.get('/getLoggedInUsername', (req, res) => {
    const loggedInUsername = req.session.username;

    if (!loggedInUsername) {
        res.status(401).send('User not logged in');
        return;
    }

    res.send(loggedInUsername);
});

*/


// Other routes and functionalities...

// Close the OracleDB connection on process termination


process.on('SIGINT', async () => {
    try {
        if (connection) {
            await connection.close();
            console.log('Oracle Database connection closed');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error closing Oracle Database connection:', err);
        process.exit(1);
    }
});

// Start the server
const port = process.env.PORT || 1337;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
