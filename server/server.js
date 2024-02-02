const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
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
  try {
    const result = await pool.query("SELECT * FROM videos");
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

// POST "/"
app.post("/", async (req, res) => {
  const { title, url } = req.body;

  if (
    !title ||
    !url ||
    !url.match(/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+(&\S+)?$/)
  ) {
    return res.status(400).json({
      result: "failure",
      message: "Invalid input. Video could not be saved.",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO videos (title, url, upvotes, downvotes) VALUES ($1, $2, $3, $4) RETURNING id",
      [title, url, 0, 0]
    );

    const newId = result.rows[0].id;

    res.status(201).json({ id: newId });
    console.log(`Inserted new video with ID: ${newId}`);
  } catch (error) {
    console.error("Error inserting new video:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/:id/upvotes", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE videos SET upvotes = upvotes + 1 WHERE id=$1 RETURNING *",
      [id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating upvotes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/:id/downvotes", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE videos SET downvotes = downvotes + 1 WHERE id=$1 RETURNING *",
      [id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating downvotes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedVideo = await pool.query("DELETE FROM videos WHERE id=$1", [
      id,
    ]);
    if (!deletedVideo) {
      res.status(404).json({
        message: "There is no video with given data!",
      });
    } else {
      res.status(200).json({
        message: "Video removed successfully",
        isPositive: true,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "something went wrong!",
    });
  }
});
