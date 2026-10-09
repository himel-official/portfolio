# Himel Mahmud Portfolio — Google Gemini AI

The existing portfolio design and terminal UI are preserved. The chat endpoint calls Gemini from the Node.js server, so the API key is never shipped to the browser.

## Run locally

Requirements: Node.js 18 or newer and a Gemini API key.

1. Extract the project and open a terminal in this `portfolio` folder.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`:
   - macOS/Linux: `cp .env.example .env`
   - Windows PowerShell: `Copy-Item .env.example .env`
4. Create a key at <https://aistudio.google.com/apikey> and put it in `.env` as `GEMINI_API_KEY=...`.
5. Start the app: `npm start`
6. Open <http://localhost:3000>.

Do not open `index.html` directly with `file://`; the chat requires the Node.js server. Never commit `.env` or put the key in `script.js`.

## Deploy free on Render

1. Push the contents of this project to a GitHub repository. Do not upload `.env` or your API key.
2. Sign in to <https://render.com/> and choose **New → Web Service**. Connect the repository.
3. Set **Root Directory** to `portfolio` only if the repository contains this folder inside a parent folder. If the repository root contains `server.js` and `package.json`, leave Root Directory blank.
4. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
5. Choose the Free instance plan.
6. In Render's **Environment** settings, add `GEMINI_API_KEY` with the value from AI Studio. Optionally add `GEMINI_MODEL=gemini-2.5-flash-lite`.
7. Deploy, then open the `onrender.com` URL and test the terminal chatbot.

Render free web services sleep after 15 minutes without traffic and can take about a minute to wake up. Free-tier availability and limits can change. Gemini API free usage is subject to Google's current model, region, and rate limits; do not assume unlimited usage. Check <https://ai.google.dev/gemini-api/docs/pricing>.

## Troubleshooting

- **AI backend OFFLINE**: check that the deployed service is running and `/api/health` responds.
- **Missing GEMINI_API_KEY**: add the variable to `.env` locally or Render Environment settings, then restart/redeploy.
- **Gemini rejected the request**: verify the API key at AI Studio and that the selected model is available to your project.
- **Free usage limit reached**: wait for the quota window to reset; check AI Studio usage limits.
- **Do not expose the API key** in frontend JavaScript, GitHub, screenshots, or public logs. Rotate it if exposed.


### AI status indicator

The terminal checks the configured Gemini model through the backend before showing `Gemini AI API ... ONLINE`. If the web server runs but the model/key is unavailable, it shows `OFFLINE` and a configuration hint. The health check is cached for 30 seconds.
