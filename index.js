import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://earnimgtricks300:shreyash0%401234@cluster0.ws6db.mongodb.net/interview")
.then(() => console.log("MongoDB connected"));

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// Feed schema and model
const feedSchema = new mongoose.Schema({
  title: String,
  content: String,
  username: String,
}, { timestamps: true });

const Feed = mongoose.model("Feed", feedSchema);

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Auth routes
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ message: "Username already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: "User registered" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" });
  res.json({ token });
});

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the Interview Feed API!');
});

// Protected feed routes
app.get("/api/feeds", auth, async (req, res) => {
  const feeds = await Feed.find().sort({ createdAt: -1 });
  res.json(feeds);
});

app.post("/api/feeds", auth, async (req, res) => {
  console.log("Received new feed:", req.body);
  const { title, content } = req.body;
  const username = req.user.username;
  const newFeed = new Feed({ title, content, username });
  await newFeed.save();
  res.status(201).json(newFeed);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
