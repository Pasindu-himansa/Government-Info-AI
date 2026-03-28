const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/ask", (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const command = `python query.py "${question.replace(/"/g, "'")}"`;

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    const lines = stdout.split("\n");
    const answerLine = lines.find((l) => l.startsWith("Answer:"));
    const sourcesLine = lines.find((l) => l.startsWith("Sources found:"));

    const answer = answerLine
      ? answerLine.replace("Answer: ", "")
      : "No answer found";
    const sources = sourcesLine ? sourcesLine : "";

    res.json({ answer, sources });
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
