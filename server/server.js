const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.options("*", cors());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

app
  .listen(port, () => {
    console.log(`Listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
  });
app.get("/", async (req, res) => {
  const { order } = req.query;
  let orderBy = "upvotes - downvotes DESC";

  if (order === "asc") {
    orderBy = "upvotes - downvotes ASC";
  }

  try {
    const result = await pool.query(`SELECT * FROM videos ORDER BY ${orderBy}`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET "/{id}"
app.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({
      result: "failure",
      message: "Invalid video ID",
    });
    return;
  }

  try {
    const result = await pool.query("SELECT * FROM videos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        result: "failure",
        message: "Video not found",
      });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update video rating by incrementing upvotes
app.put("/ratingup/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const video = await pool.query(
      "UPDATE videos SET upvotes = upvotes + 1 WHERE id=$1",
      [id]
    );
    if (!video.rowCount) {
      res.status(404).json({
        message: "There is no video with the given ID!",
      });
    } else {
      res.status(200).json({
        message: "Upvote successful",
        isPositive: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
});

// Update video rating by incrementing downvotes
app.put("/ratingdown/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const video = await pool.query(
      "UPDATE videos SET downvotes = downvotes + 1 WHERE id=$1",
      [id]
    );
    if (!video.rowCount) {
      res.status(404).json({
        message: "There is no video with the given ID!",
      });
    } else {
      res.status(200).json({
        message: "Downvote successful",
        isPositive: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
});

// POST "/"
app.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required."),
    body("url")
      .notEmpty()
      .withMessage("URL is required.")
      .isURL({ require_protocol: true })
      .withMessage("Please provide a valid URL.")
      .custom((value) => {
        // Custom validation: Check if URL is a YouTube URL
        const youtubeRegExp =
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        if (!youtubeRegExp.test(value)) {
          throw new Error("URL must be a valid YouTube URL.");
        }
        return true;
      }),
  ],
  async (req, res) => {
    // Check for errors in the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url } = req.body;

    try {
      // Check if a video with the same URL already exists
      const existingURL = await pool.query(
        "SELECT * FROM videos WHERE url=$1",
        [url]
      );
      if (existingURL.rows.length > 0) {
        return res.status(409).json({
          message: "A video with this URL already exists.",
        });
      }

      const id = uuidv4();
      // If not, insert a new one
      await pool.query(
        "INSERT INTO videos(id, title, url, upvotes, downvotes) VALUES($1, $2, $3, $4, $5)",
        [id, title, url, 0, 0]
      );
      res.status(201).json({
        message: "New video added successfully.",
      });
    } catch (error) {
      console.error("Error adding new video:", error);
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  }
);

// DELETE "/{id}"
app.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deletedVideo = await pool.query("DELETE FROM videos WHERE id=$1", [
      id,
    ]);

    if (deletedVideo.rowCount === 0) {
      // If rowCount is 0, no rows were affected, meaning the video wasn't found
      res.status(404).json({
        message: "Video not found",
      });
    } else {
      // If rowCount is greater than 0, deletion was successful
      res.status(200).json({
        message: "Video removed successfully",
      });
    }
  } catch (err) {
    console.error("Error deleting video:", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
