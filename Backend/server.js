const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Note: In production, set this to true and use HTTPS
}));

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

// Create User Model
const User = mongoose.model("User", UserSchema);

// Login endpoint
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.json({ message: "Login successful", user });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Logout endpoint
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Logout successful" });
});

// Middleware to check if user is logged in
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
}

// Protected route
app.get("/protected", checkAuth, (req, res) => {
    res.json({ message: "You are authenticated", user: req.session.user });
});

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost/WebProgramming")
    .then(() => {
        console.log("Connected to MongoDB");
        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });