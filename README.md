# CodeTube

CodeTube is a web application that transforms passive YouTube coding tutorials into interactive, hands-on learning courses. It leverages AI to streamline course creation and provides tools for both creators and students to engage with educational content more effectively.

## Problem

Watching long-form video tutorials on platforms like YouTube is often a passive experience. Viewers can find it difficult to:
- Navigate to specific topics within a long video.
- Take organized, time-stamped notes.
- Extract and save important code snippets shown in the video.
- Showcase their completed tutorial as a project in their portfolio.
- Verify their understanding of the material.

This leads to lower engagement, reduced knowledge retention, and a missed opportunity to turn learning into a tangible skill.

## Solution

CodeTube addresses these challenges by providing a suite of tools for creators to enrich video content:

- **AI Course Mentor:** Generate a comprehensive, step-by-step learning plan for any topic, complete with prerequisite videos, key concepts, and a full roadmap of video suggestions from multiple creators.
- **YouTube Video Import:** Instantly import any YouTube video by pasting a link or using the built-in search.
- **Automatic Chapter Detection:** The app automatically parses the video description to find and import time-stamped chapters.
- **AI-Powered Notes & Summaries:** For each chapter, creators can generate concise, AI-powered summaries or use **speech-to-text** to dictate notes directly.
- **Interactive Quizzes & Interview Prep:** Add AI-generated multiple-choice quizzes and technical interview questions to reinforce learning and prepare for job interviews.
- **Focus Mode:** Customize your workspace by toggling UI elements like the **Chapter Title, Notes, Code Editor, Quiz, and Interview Prep** sections to eliminate distractions.
- **AI-Powered Writing Tools:** Instantly proofread, rewrite, or translate your notes into different languages.
- **GitHub Export:** Export the entire course, including notes and code snippets, to a new GitHub repository with a single click.

This turns a simple video into a structured, interactive course that promotes active learning.

## CodeTube Architecture

This document provides a high-level overview of the CodeTube application's architecture, including its frontend, backend, AI components, and user flow.

### Architecture

CodeTube is built on a modern, serverless architecture designed for scalability and rapid development.

- **Frontend:** A responsive web application built with **Next.js**, **React**, and **TypeScript**. Styling is handled by **Tailwind CSS** and **ShadCN UI** for a polished, component-based design.
- **Backend & Authentication:** **Firebase** is used for user authentication (Email/Password) and as a **Firestore** database to save user-created courses and chapters.
- **Generative AI:** A hybrid AI model is used. For browsers that support it (like Chrome 127+), AI features run **on-device** for instant feedback. For other browsers, the app seamlessly falls back to server-side AI powered by the **Google Gemini API**, orchestrated through the open-source **Genkit** framework.
- **Hosting:** The application is deployed on **Vercel**, providing a scalable, secure, and globally distributed environment.

### Technology Roles

It's important to understand the role of each major component in the stack:

- **Firebase Studio**: This is the integrated development environment (IDE) where we write, edit, and manage the application's code.
- **Chrome's Built-in AI**: For supported browsers, this provides fast, on-device AI for tasks like summarizing and editing text, offering a better user experience without needing a server call.
- **Genkit**: This is the open-source TypeScript framework we use to structure and orchestrate our server-side AI logic, which serves as a reliable fallback for all users. It helps us define `flows` that can call AI models.
- **Gemini API**: This is the actual generative model from Google that performs the AI tasks when server-side processing is needed. Genkit calls the Gemini API to generate text, summarize content, and more.
- **Firebase**: This is the suite of backend services providing the application's database (Firestore) and user login system (Authentication).

### API Usage

The application integrates with several external APIs to power its features:

| API Provider | Library Used | Core Features Powered |
| :--- | :--- | :--- |
| **Google (YouTube)** | `googleapis`, `youtube-transcript` | **Video & Transcript Import:** Fetches video titles, descriptions, and full transcripts. This is the foundation for all content analysis. |
| **Google (Gemini API via Genkit)** | `genkit`, `@genkit-ai/google-genai`| **Server-Side AI:** Powers all advanced AI features, including learning plans, quizzes, code explanations, speech-to-text, and serves as a fallback for on-device AI. |
| **Google (Chrome Built-in AI)** | `window.ai` | **On-Device AI:** Handles instant text generation for summaries, proofreading, and rewriting directly in supported browsers for enhanced performance. |
| **GitHub** | `@octokit/rest` | **Export to GitHub:** Creates a new repository, generates Markdown files for the course, and pushes the content to the user's GitHub account. |
| **Judge0** | `axios` (within a Genkit flow) | **Interactive Code Execution:** Allows users to run code snippets directly within a chapter and see the output. |


#### In-App AI Features (Hybrid Client/Server Model)

Our core AI capabilities are delivered through a hybrid approach for the best performance and reliability.

- **Client-Side First (Chrome Built-in AI)**: For users on supported browsers, the following features run directly on-device for instant results:
    - **"Generate Summary"**: Creates initial notes for a chapter based on the transcript.
    - **"Writing Tools" (Proofreader, Rewriter, Translator)**: Corrects grammar, refines existing notes, or translates them into different languages.

- **Server-Side Fallback & Advanced Features (Gemini API via Genkit)**: If the browser's built-in AI is unavailable, the above features seamlessly fall back to our server-side Genkit flows. The following more complex features always run on the server:
    - **Course Mentor & Learning Plan Generator**:
        - **Generate Learning Roadmap**: For any given topic, the AI generates a step-by-step learning plan.
        - **Prerequisite Identification**: Automatically identifies and suggests videos for prerequisite knowledge.
        - **Key Concept Summary**: Provides a list of key concepts and jargon for the topic.
        - **AI-Powered Video Suggestions**: Finds relevant YouTube videos for each step of the roadmap.
    - **Quiz Generator**: Analyzes chapter transcripts to create multiple-choice questions.
    - **Interview Prep Generator**: Creates relevant technical interview questions based on chapter content.
    - **Speech-to-Text**: Transcribes spoken audio into text for note-taking or answering interview questions.
    - **Pitch Feedback System**: Analyzes a user's answer to an interview question and provides constructive feedback.
    - **Code Explainer**: Generates a step-by-step explanation for a given code snippet.
    - **Code Error Fixer**: Analyzes incorrect code and an error message to provide a corrected version.

### Network Resilient UX & Offline Functionality

CodeTube is designed with an "offline-first" mentality to provide a consistent and fast user experience, even on unstable connections. This is achieved through a combination of technologies:

- **PWA for Offline Access:** The app is a Progressive Web App (PWA) that caches all necessary pages and assets, allowing you to open and browse the application even without an internet connection.
- **Firestore Offline Persistence:** All your course and chapter data is automatically saved to a local database (IndexedDB) in your browser. This allows for instant read and write operations, regardless of your network status.
- **Background Sync:** Changes made while offline are queued and automatically synchronized with the cloud once you reconnect, ensuring data consistency without blocking the UI.
- **On-Device AI:** For users with supported browsers (like Chrome), many AI writing tools run directly on your device, providing instant feedback without needing to call a server.

#### Available Offline
You can perform the following actions without an active internet connection after your data has been loaded at least once:
- **View Courses and Chapters**: All your previously loaded courses and their content are available for browsing.
- **Edit Content**: You can edit chapter titles, notes, and code snippets. The UI updates instantly.
- **Manage Courses & Chapters**: You can create new courses, add new chapters, or delete existing ones.
- **Use On-Device AI Tools**: In supported browsers, you can use writing tools like proofreading and rewriting completely offline.

#### Requires Internet Connection
The following features require an active internet connection as they rely on external, real-time APIs:
- Importing new videos from YouTube.
- AI features that run on the server (generating quizzes, interview prep, speech-to-text, and fallback for on-device AI).
- Exporting your course to GitHub.
- Running code snippets using the interactive code execution feature.

### User Flow

The following is a typical user journey through the CodeTube application.

1.  **Landing Page:** New users arrive at a landing page that explains the product's features and benefits.

2.  **Authentication:** Users can **Sign Up** for a new account or **Sign In** to an existing one using their email and password.

3.  **Creator Studio:** After logging in, users are redirected to the main dashboard where they can see their existing courses or create a new one.

4.  **Import Video:** The user pastes a public YouTube video URL or uses the search function to find a video.
    - A server action is called, which uses the YouTube Data API to fetch the video's title and description.
    - The description is parsed to automatically detect any time-stamped chapters.

5.  **Edit Chapters:** The detected chapters are displayed in a list. The user can:
    - Select a chapter to edit its title, timestamp, and add a code snippet.
    - Use the **"Writing Tools"** to generate AI summaries, proofread text, or rewrite notes.
    - Use the **"Record Note"** feature to dictate notes via speech-to-text.
    - Use the **"Focus Mode"** to toggle different UI elements and create a distraction-free workspace.
    - Click **"Explain Code"**, **"Generate Quiz"**, or **"Generate Interview Prep"** to create interactive learning materials.

6.  **Export to GitHub:** Once the course is complete, the user can open the "Export to GitHub" dialog to create a new public repository containing their course content.

## MIT License

Copyright (c) 2024 Google LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
