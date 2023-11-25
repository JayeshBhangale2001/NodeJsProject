/*// Inside requestHandlers.js

const fs = require('fs');
const path = require('path');

function handleHTMLRequests(req, res) {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
}

function handleStaticFiles(req, res) {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : `.${req.url}`);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.css':
            contentType = 'text/css';
            break;
        default:
            break;
    }

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}
function handleLogin(req, res, connection) {
    if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            const formData = new URLSearchParams(body);
            const username = formData.get('username');
            const password = formData.get('password');

            const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
            connection.query(query, (err, results) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                    return;
                }
                if (results.length > 0) {
                    res.writeHead(302, {
                        'Location': '/Dashboard.html' // Redirect to the dashboard page
                    });
                    res.end();
                } else {
                    // Invalid credentials
                    res.writeHead(401);
                    res.end('Invalid credentials');
                }
            });
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
}

function handleSignup(req, res, connection) {
    if (req.method === 'POST' && req.url === '/signup') {
        let body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            const formData = new URLSearchParams(body);
            const signupUsername = formData.get('signupUsername');
            const signupPassword = formData.get('signupPassword');
            const confirmPassword = formData.get('confirmPassword');

            // Verify password match
            if (signupPassword !== confirmPassword) {
                res.writeHead(400);
                res.end('Passwords do not match');
                return;
            }

            // Perform database query to insert new user
            const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            connection.query(insertQuery, [signupUsername, signupPassword], (error, results) => {
                if (error) {
                    res.writeHead(500);
                    res.end('Error signing up');
                    console.error('Error signing up:', error);
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Signed up successfully! Proceed to login.');
                }
            });
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
}

module.exports = { handleHTMLRequests, handleStaticFiles, handleLogin, handleSignup };

*/