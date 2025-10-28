# CodeTube 🚀

**Transform Passive YouTube Coding Tutorials into Interactive Courses**

CodeTube is a web application that converts passive YouTube coding tutorials into interactive, hands-on learning courses. Leveraging client-side and server-side AI, it provides tools for creators and students to actively engage with educational content.

---

## Problem Statement ❌

Watching long-form YouTube tutorials is often passive and unstructured:

- Difficult to navigate to specific topics
- Hard to take organized, time-stamped notes
- Challenging to extract and save code snippets
- No easy way to showcase learning as a portfolio project
- Limited verification of understanding

This leads to lower engagement, reduced knowledge retention, and missed opportunities to convert learning into real skills.

---

## Solution 🌟

CodeTube transforms a simple video into a structured, interactive learning experience:

- **AI Course Mentor 🧭**: Generates step-by-step learning plans, prerequisites, key concepts, and recommended videos.
- **YouTube Video Import 🎥**: Quickly import any YouTube tutorial.
- **Automatic Chapter Detection ⏱️**: Detect time-stamped chapters from video descriptions.
- **AI-Powered Notes & Summaries 📝**: Generate editable summaries or dictate notes via speech-to-text.
- **Timestamped Video Snapshots 📸**: Insert clickable snapshots of the video into your notes, creating visual bookmarks.
- **Interactive Quizzes & Interview Prep ❓💼**: Reinforce learning and practice job interview questions.
- **Focus Mode 🎯**: Customize your workspace by toggling UI elements to eliminate distractions and concentrate on what matters.
- **Practice Your Pitch 🎤**: Respond to an AI-generated interview scenario using your voice and receive instant, AI-powered feedback on your answer and delivery.
- **AI Writing Tools ✍️**: Proofread, rewrite, and translate notes.
- **Code Snippet Execution 💻**: Run code directly in chapters.
- **Export to GitHub 📂**: Push full course content to a repository with one click.

---


## Tech Stack 🛠️

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend:** Firebase Authentication, Firestore
- **AI:** Hybrid AI with Chrome Built-in AI (client-side) & Gemini Nano via Genkit (server-side)
- **APIs:** YouTube API, Gemini Nano API, GitHub API, Judge0 API
- **Hosting:** Vercel

---

## Features vs APIs ✅

| Feature | Client-Side APIs 🌐 | Server-Side APIs ☁️ | Notes |
|---------|-------------------|-------------------|------|
| Import YouTube Video 🎥 | ❌ | ✅ YouTube API | Fetch video title, description, transcript |
| Automatic Chapter Detection ⏱️ | ❌ | ✅ YouTube API + Gemini Nano | Detect timestamps from description |
| AI-Powered Notes & Summaries 📝 | ✅ Prompt, Writer, Summarizer, Proofreader, Translator, Rewriter, Built-in AI | ✅ Gemini Nano | Editable notes |
| Course Mentor / Learning Plan Generator 🧭 | ❌ | ✅ Gemini Nano | Generates roadmap, prerequisites, key concepts, video suggestions |
| Interactive Quizzes ❓ | ✅ Prompt, Writer, Rewriter, Built-in AI | ✅ Gemini Nano | Generate multiple-choice questions |
| Interview Prep Generator 💼 | ✅ Prompt, Writer, Rewriter, Built-in AI | ✅ Gemini Nano | Technical interview questions |
| Practice Your Pitch 🎤 | ❌ | ✅ Gemini Nano | Speech-to-text transcription and AI feedback on user's answer |
| Focus Mode 🎯 | ✅ Built-in AI | ❌ | Customize workspace UI (client-side state management) |
| Code Snippet Execution 💻 | ❌ | ✅ Judge0 API | Run code directly |
| Export to GitHub 📂 | ❌ | ✅ GitHub API | Push course content |
| Proofreading / Rewriting Notes ✍️ | ✅ Proofreader, Rewriter, Writer, Built-in AI | ✅ Gemini Nano | Grammar correction, content rewriting |
| Notes Translation 🌐 | ✅ Translator API, Built-in AI | ✅ Gemini Nano | Translate notes |

---

## Hybrid AI Strategy 🤖: 
  - **Client-side AI (Chrome Built-in AI)**: Provides instant text generation for summaries, proofreading, rewriting, and translations directly in the browser. Works offline on supported devices.  
  - **Server-side AI (Gemini Nano via Genkit / Firebase AI Logic)**: Handles advanced features like the Course Mentor roadmap, AI-generated quizzes, interview prep, and speech-to-text. Ensures full functionality for users on any device, including mobile, even if their browser doesn't support client-side AI.  
  - **Benefit**: Expands reach to more users, maintains consistent performance, and provides offline-first capabilities.

The application is designed with a "Hybrid AI" strategy, which is a strength. It tries to use the fast, free, and private on-device Chrome AI when it's available. If it's not available (for example, if the user is on Firefox or Safari), it automatically falls back to using the powerful server-side Gemini AI. This ensures the feature works for all users. The problem was never in this fallback logic; it was in getting the necessary data to the logic in the first place.

---

## How CodeTube Differs from Existing Projects 🔍

| Existing Solutions | CodeTube |
|-------------------|----------|
| Passive video tutorials only | Interactive, chaptered courses |
| No automated summaries or quizzes | AI-generated summaries, quizzes, and interview prep |
| Limited or no offline support | Offline-first PWA with local caching and on-device AI |
| Manual note-taking | AI-powered notes, speech-to-text, proofreading, rewriting, translation |
| No project portfolio integration | Export course + notes + code to GitHub directly |
| No learning roadmap | AI Course Mentor creates a guided learning plan |

---

## Network-Resilient UX & Offline Functionality 🌐⚡

- **Offline-first PWA**: Browse courses and chapters even without internet.
- **Firestore Offline Persistence**: Read/write course data locally.
- **Background Sync**: Offline changes auto-sync when back online.
- **On-Device AI Tools**: Instant text generation, proofreading, rewriting in supported browsers.

**Available Offline:**

- View previously loaded courses and chapters
- Edit titles, notes, and code snippets
- Create/delete courses and chapters
- Use on-device AI writing tools

**Requires Internet:**

- Importing new YouTube videos
- Server-side AI features (advanced quizzes, interview prep, speech-to-text)
- Export to GitHub
- Code snippet execution via Judge0 API

---

## Judging Criteria 🏆

- **Functionality ⚙️**: Scalability, API usage, cross-region or cross-device applicability.
- **Purpose 🎯**: Meaningful improvement of user tasks; new capabilities unlocked.
- **Content 🎨**: Creativity, originality, and visual quality.
- **User Experience 🖱️**: Ease of use, intuitiveness, and accessibility.
- **Technological Execution 💻**: Effective demonstration of Chrome’s built-in AI APIs (Prompt, Summarizer, Writer, Rewriter, Translator, Proofreader) and hybrid AI usage.

---

## 🏆 Tracks Applied

This project is submitted under the **Web Application track** of the Google Chrome Built-in AI Challenge 2025.  

### 1. Most Helpful - Web Application 💡
- Provides a fully functional learning platform for coding tutorials.  
- Users can import videos, take AI-powered notes, and generate quizzes.  
- Enhances productivity and knowledge retention, making it genuinely helpful for learners.

### 2. Best Multimodal AI Application - Web Application 🖼️
- Supports multimodal content: YouTube videos, text notes, and interactive code snippets.  
- Uses AI APIs like **Prompt, Summarizer, Writer, Rewriter, Translator, Proofreader** to process multiple input types.  
- Delivers rich, interactive learning experiences beyond just text or video.

### 3. Best Hybrid AI Application - Web Application ⚡
- Combines **client-side AI** (Chrome Built-in AI APIs) with **server-side AI** (Gemini API via Genkit/Firebase AI Logic).  
- Ensures offline capability, fast responses, and consistent AI performance across browsers.  
- Demonstrates a hybrid AI strategy optimized for web applications.

---


## License 📄

MIT License. See [LICENSE](LICENSE) for details.
