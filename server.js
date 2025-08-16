// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002;

// POST /correct-text — corrects highlighted text
app.post("/correct-text", async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: "No text provided" });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Missing OpenAI API key" });
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a grammar and spelling corrector. Fix errors but keep original meaning."
                    },
                    { role: "user", content: text }
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("OpenAI API error:", errText);
            return res.status(500).json({ error: "Error from OpenAI API", details: errText });
        }

const data = await response.json();
const corrected = data.choices?.[0]?.message?.content?.trim() || text;

// Debug logs
console.log("📝 OpenAI raw response:", JSON.stringify(data, null, 2));
console.log("✅ Final corrected text:", corrected);

res.json({ correctedText: corrected });

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ AI Text Corrector server running at http://localhost:${PORT}`);
});
