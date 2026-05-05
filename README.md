Savvy Lift - Fitness PWA
A mobile-first strength training tracker built with React and Vite, focusing on progressive overload and seamless Google Sheets integration.

🚀 Overview
Savvy Lift is designed for users who want a lightweight, high-performance tool to track workout progress. It fetches historical data directly from Google Sheets to provide real-time weight recommendations and saves workout sessions back to the cloud.

Tech Stack
Frontend: React 18+ (Vite)

State: React Hooks + LocalStorage Persistence

Backend: Google Sheets API (Google Apps Script)

Styling: Modern CSS (Mobile-responsive)

🛡️ AI & Developer Guardrails (CRITICAL)
Before making any code changes, read these rules:

No Unsolicited Refactoring: Do not simplify or restructure the logic (especially getRecommendation and parseNum) unless explicitly requested.

Preserve Data Schema: Data headers like s1_weight, s1_reps, and exercisename must match the Google Sheets backend exactly.

No Summarization: Always provide the full file content when suggesting updates.

UI Consistency: The app renders sets directly from the ex.sets array. Do not attempt to use targetSets variables for UI rendering.

📘 Technical Documentation
Data Integration
The app communicates with a Google Apps Script Web App.

GET: Fetches workout history. Handles both direct arrays and object-wrapped data ({ data: [...] }).

POST: Submits workout payloads as JSON strings. Uses mode: 'no-cors' for cross-origin compatibility.

Recommendation Logic
The getRecommendation function uses EXERCISE_DICTIONARY to find matches in historical data.

Normalization: All names are trimmed and lowercased before comparison.

Increment: If the user hits the maximum reps in a range, the app suggests a weight increase based on the increment value defined in WORKOUT_DATA.

Crash Recovery
Ongoing workouts are saved to localStorage under the DRAFT_KEY. If the browser refreshes, the session is hydrated automatically.

🗺️ Roadmap & Next Steps
[x] UI: Modal input width & button styling

[x] Basic Exercise Swapping & Removal

[x] Dynamic Exercise Addition (EXERCISE_BANK)

[ ] History view: List saved sessions by date

[ ] Progress view: Simple charts for exercise volume

[ ] Summary view: Count of completed sets/reps post-workout

[ ] PWA polish: Custom icons & manifest configuration

🛠️ Development
Setup
Bash
npm install
npm run dev
Deployment
Build the project: npm run build

Push to your hosting provider or GitHub Pages.