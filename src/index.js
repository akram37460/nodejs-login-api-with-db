const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'NodejsLogin';

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let client; // Define client variable outside try block

    try {
        client = new MongoClient(url);
        await client.connect();

        const db = client.db(dbName);
        const users = db.collection('users');
        // Find user by username
        const user = await users.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
