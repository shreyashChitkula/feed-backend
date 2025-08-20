import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://earnimgtricks300:shreyash0%401234@cluster0.ws6db.mongodb.net/interview", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Feed schema and model
const feedSchema = new mongoose.Schema({
  title: String,
  content: String,
  username: String,
}, { timestamps: true });

const Feed = mongoose.model("Feed", feedSchema);

// Routes
app.get("/api/feeds", async (req, res) => {
  const feeds = await Feed.find().sort({ createdAt: -1 });
  res.json(feeds);
});

app.post("/api/feeds", async (req, res) => {
    console.log("Received new feed:", req.body);
  const { title, content, username } = req.body;
  const newFeed = new Feed({ title, content, username });
  await newFeed.save();
  res.status(201).json(newFeed);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
