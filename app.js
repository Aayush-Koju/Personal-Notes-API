const fs = require("fs");
const path = require("path");
const express = require("express");
const { error } = require("console");
const app = express();

const notesFilePath = path.join("data-store/", "notes.json");

app.use(express.json());

app.get("/notes", (req, res) => {
  fs.readFile(notesFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read note" });
    res.json(JSON.parse(data));
  });
});

app.get("/notes/:id", (req, res) => {
  const noteId = parseInt(req.params.id);

  fs.readFile(notesFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read note" });

    const notes = JSON.parse(data);
    const note = notes.find((n) => n.id === noteId);

    if (!note) return res.status(404).json({ error: "Note not found" });

    res.json(note);
  });
});

app.post("/notes", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const newNote = { id: Date.now().toString(), title, content };

  fs.readFile(notesFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "failed to read notes" });

    let notes = [];

    if (data) {
      try {
        notes = JSON.parse(data);
      } catch (err) {
        return res.status(500).json({ error: "Failed to parse notes data" });
      }
    }

    notes.push(newNote);
    fs.writeFile(
      notesFilePath,
      JSON.stringify(notes, null, 2),
      "utf8",
      (err) => {
        if (err)
          return res.status(500).json({ error: "Failed to create note" });
        res.status(201).json(notes);
      }
    );
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(PORT);
});
