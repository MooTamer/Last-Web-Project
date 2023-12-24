const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const app = express();
const port = 3001;

app.use(cors({
  origin: "http://127.0.0.1:5501", // Update this with your frontend origin
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());



app.use(
  session({
    secret: "3",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, 
  })
);

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
  phone_number: {

    type: String,
    required: false,
    unique: true,
  },
});



const User = mongoose.model("User", UserSchema);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/home.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  console.log(user);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user;
    res.json({ message: "Login successful", user });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone_number } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone_number,
    });
    res.json({ message: "Registered successfully", newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ message: error.message });
  }
});

// Logout endpoint
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Could not log out, please try again" });
    } else {
      return res.json({ message: "Logout successful" });
    }
  });
});

function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
}

app.get("/protected", checkAuth, (req, res) => {
  res.json({ message: "You are authenticated", user: req.session.user });
});

mongoose
  .connect("mongodb://localhost/WebProgramming")
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
