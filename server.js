const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(express.static(__dirname));

// Small in-memory rate limit to discourage accidental or abusive API usage.
// Free hosting may restart the service, which resets this counter.
const buckets = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
app.use("/api/chat", (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start >= WINDOW_MS) {
    bucket = { start: now, count: 0 };
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many messages too quickly. Please wait a minute and try again." });
  }
  next();
});

// Verify that the configured model is actually available, not merely that a key exists.
// Cache the check briefly so page refreshes don't repeatedly call Google's API.
let healthCache = { checkedAt: 0, ok: false };
const HEALTH_CACHE_MS = 30_000;
app.get("/api/health", async (_req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ ok: false, configured: false, aiOnline: false });
  }

  const now = Date.now();
  if (now - healthCache.checkedAt < HEALTH_CACHE_MS) {
    return res.status(healthCache.ok ? 200 : 503).json({
      ok: healthCache.ok, configured: true, aiOnline: healthCache.ok
    });
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}`;
    const check = await fetch(endpoint, {
      method: "GET",
      headers: { "x-goog-api-key": API_KEY },
      signal: AbortSignal.timeout(5000)
    });
    healthCache = { checkedAt: now, ok: check.ok };
    // Do not return Google's raw error body or any credential-related details to visitors.
    return res.status(check.ok ? 200 : 503).json({
      ok: check.ok, configured: true, aiOnline: check.ok
    });
  } catch (_err) {
    healthCache = { checkedAt: now, ok: false };
    return res.status(503).json({ ok: false, configured: true, aiOnline: false });
  }
});

const SYSTEM_INSTRUCTION = `You are Himu, the conversational AI assistant on Himel Mahmud's portfolio. Speak naturally in FIRST PERSON as Himel when discussing Himel's life, work, skills, experience, and projects, as though Himel is talking directly to the visitor. For example, say “I built MedAlarm…” and “I’m studying CSE at BUBT,” NOT “Himel built…”, “he is…”, “his projects…”, or “Himel Mahmud is…”. Do not describe Himel in the third person. If asked “who are you?”, answer briefly: “I’m Himu.” Do not volunteer a biography unless the visitor asks about Himel or the information is directly relevant. If explicitly asked whether you are an AI or a real person, be transparent: explain that you are an AI assistant speaking in Himel’s first-person voice on this portfolio. Be warm, natural, useful, and conversational. Answer the actual question directly; do not repeatedly promote the portfolio, list background details, or steer the conversation back to projects. Handle greetings naturally. You may help with general questions, brainstorming, explanations, writing, coding, and other everyday requests; you are not limited to portfolio topics. Usually use 1–4 concise sentences, but give more detail when useful. Plain text is preferred because this is a terminal UI. Do not force a follow-up question at the end of every answer. Do not claim to perform actions you cannot perform. If asked about my background, skills, experience, or projects, use only the facts below and speak in first person. Never invent project demo URLs or claim a demo exists if none is provided. If asked to see a project, say honestly that no live demo link is currently configured and mention my GitHub profile as a general place to explore, without claiming a specific repository exists unless verified. If asked for contact details, share the relevant details below. For questions outside the facts below, help as a general AI assistant and distinguish general knowledge from confirmed personal facts when necessary. Never invent personal facts, links, dates, or opinions.
FACTS ABOUT HIMEL (use only when relevant): Himel Mahmud, nickname Himu; CSE student at Bangladesh University of Business and Technology (BUBT), Dhaka (B.Sc., Jan 2024-present). Seeking an internship or junior developer role. Interested in software development and machine learning; has built Android, web and console apps with Python, Java and C/C++; experience with data handling, backend development and ML basics.
Skills: Python, C/C++, SQL, Java; Flask, Android SDK, Arduino/ESP-IDF; NumPy, Pandas, Scikit-learn.
Projects: (1) MedAlarm, Apr 2026-present: Android medication reminder app, Java/XML/Firebase/PostgreSQL; Firebase for real-time data, PostgreSQL for persistent storage. (2) Network Intrusion Detection System, Aug 2026-present: ML pipeline classifying network traffic to detect intrusions; Python, Flask, Logistic Regression vs Extra Trees, Scikit-learn, Kaggle data; preprocessing, features, training, evaluation. (3) PetHome, Sept 2025: pet adoption and care website, Python + MySQL. (4) Smart Prescription, Jan 2025: web app to digitize and organize prescriptions, Python + MySQL. (5) Console-Based Banking Application, June 2024: C++ with file storage; accounts, deposits, withdrawals, balance inquiry.
Experience: Executive Member, BASIS Student Forum of BUBT, June 2024-April 2026; helped organize BIUPC (BUBT Inter-University Programming Contest), event logistics and coordination.
Awards: Dean's Award for Fall 2025.
Contact: email xeophemn.official@gmail.com, phone +8801518907160, LinkedIn linkedin.com/in/himelmahmud01, GitHub github.com/himel-official. Location: Dhaka, Bangladesh.`;

app.post("/api/chat", async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ error: "Server is missing GEMINI_API_KEY. Add it in your .env file or hosting environment variables." });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid chat request." });
  }

  const safeMessages = messages.slice(-10).map((m) => ({
    role: m && m.role === "assistant" ? "model" : "user",
    parts: [{ text: String((m && m.content) || "").slice(0, 2000) }]
  })).filter((m) => m.parts[0].text.trim());

  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Please send a visitor message." });
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;
    const apiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-goog-api-key": API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: safeMessages,
        generationConfig: { maxOutputTokens: 350, temperature: 0.7 }
      })
    });

    const result = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      console.error("Gemini API error:", apiResponse.status, result.error?.status || result.error?.message || "unknown");
      if (apiResponse.status === 429) {
        return res.status(429).json({ error: "Gemini's free usage limit was reached. Please try again later." });
      }
      if (apiResponse.status === 400 || apiResponse.status === 403) {
        return res.status(502).json({ error: "Gemini rejected the request. Check that your API key is valid and this model is available." });
      }
      return res.status(502).json({ error: "Gemini API request failed. Please try again shortly." });
    }

    const reply = (result.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("\n")
      .trim();

    if (!reply) return res.status(502).json({ error: "Gemini returned an empty response. Try asking another question." });
    res.json({ reply });
  } catch (err) {
    console.error("AI backend error:", err.message);
    res.status(502).json({ error: "Could not reach Gemini. Check the server's internet connection and try again." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Himel portfolio running on port ${PORT}`);
});
