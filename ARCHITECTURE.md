# CodeTube Architecture

This document provides a high-level overview of the CodeTube application's architecture, including its frontend, backend, AI components, and user flow.

## Architecture

CodeTube is built on a modern, serverless architecture designed for scalability and rapid development.

- **Frontend:** A responsive web application built with **Next.js**, **React**, and **TypeScript**. Styling is handled by **Tailwind CSS** and **ShadCN UI** for a polished, component-based design.
- **Backend & Authentication:** **Firebase** is used for user authentication (Email/Password) and as a **Firestore** database to save user-created courses and chapters.
- **Generative AI:** AI features are powered by **Google's Gemini models** through the **Genkit** framework. This is used for generating chapter summaries and suggesting landing page improvements.
- **Hosting:** The application is deployed on **Firebase App Hosting**, providing a scalable, secure, and globally distributed environment.

## API Usage

The application integrates with several external APIs to power its features:

| API Provider        | Library Used                 | Features Powered                                                                                                                                                                                                                                                               |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Google (YouTube)**| `googleapis`, `youtube-transcript` | **Video & Transcript Import:** Fetches video titles, descriptions, and full transcripts when a user provides a YouTube URL. This is the foundational step for all content analysis.                                                                                    |
| **Google (Gemini)** | `genkit`, `@genkit-ai/google-genai` | **Core AI Capabilities:** Powers all generative features, including chapter summaries, code explanations, quiz generation, interview question creation, AI-powered code fixing, and the entire AI Playground (Proofreader, Summarizer, Translator, Writer, Rewriter). |
| **GitHub**          | `@octokit/rest`              | **Export to GitHub:** Creates a new repository, generates Markdown files for the course, and pushes the content to the user's GitHub account.                                                                                                                                    |
| **Judge0**          | `axios` (within a Genkit flow) | **Interactive Code Execution:** Allows users to run code snippets directly within a chapter and see the output, supporting multiple programming languages.                                                                                                                   |


## User Flow

The following is a typical user journey through the CodeTube application.

1.  **Landing Page:** New users arrive at a landing page that explains the product's features and benefits. This page is designed for marketing and user acquisition.

2.  **Authentication:** Users can **Sign Up** for a new account or **Sign In** to an existing one using their email and password. Firebase Authentication handles this securely.

3.  **Creator Studio:** After successfully logging in, users are redirected to the main application interface, the Creator Studio. This is where all course creation and editing takes place.

4.  **Import Video:** The user pastes a public YouTube video URL into the import field.
    - A server action is called, which uses the YouTube Data API to fetch the video's title and description.
    - The description is parsed to automatically detect any time-stamped chapters.

5.  **Edit Chapters:** The detected chapters are displayed in a list. The user can:
    - Select a chapter to edit its title, timestamp, and add a code snippet.
    - Click **"Generate Summary"** to trigger an AI flow. This flow sends the chapter's transcript (currently a placeholder) to a Gemini model via Genkit to generate a concise summary.
    - Click **"Explain Code"** to get an AI-powered explanation of the code snippet they provided.

6.  **Export to GitHub:** Once the course is complete, the user can open the "Export to GitHub" dialog.
    - They provide their GitHub username and a name for the new repository.
    - A server action is called, using an Octokit client authenticated with a server-side token.
    - The action creates a new public repository, a `README.md` file, and individual Markdown files for each chapter in a `chapters/` directory.
    - A success or error toast notification is shown to the user.
