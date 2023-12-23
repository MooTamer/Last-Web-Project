const express = require('express');
const app = express();
const { User } = require('./server'); 

app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username, password }, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (user) {
            res.json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

