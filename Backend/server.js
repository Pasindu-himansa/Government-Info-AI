const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// Citizen query endpoint
app.post("/api/ask", (req, res) => {
  const { question, language } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const lang = language || "en";
  const command = `python query.py "${question.replace(/"/g, "'")}" ${lang}`;

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    const lines = stdout.split("\n");
    const answerIndex = lines.findIndex((l) => l.startsWith("Answer:"));
    const sourcesIndex = lines.findIndex((l) => l.startsWith("Sources found:"));

    const answerLines = lines.slice(answerIndex, sourcesIndex).join(" ");
    const answer = answerLines
      ? answerLines.replace("Answer: ", "")
      : "No answer found";
    const sources = lines[sourcesIndex] || "";

    res.json({ answer, sources });
  });
});

// Admin upload endpoint
app.post("/api/admin/upload", upload.single("document"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, req.file.path);
  const command = `python ingest.py "${filePath}"`;

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: "Ingestion failed" });
    }

    const match = stdout.match(/Successfully stored (\d+) chunks/);
    const chunksStored = match ? parseInt(match[1]) : 0;

    res.json({ success: true, chunksStored });
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
