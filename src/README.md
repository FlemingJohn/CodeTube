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

- **YouTube Video Import:** Instantly import any YouTube video by pasting a link.
- **Automatic Chapter Detection:** The app automatically parses the video description to find and import time-stamped chapters.
- **AI-Powered Summaries:** For each chapter, creators can generate concise, AI-powered summaries of the content, making it easier for students to review.
- **Interactive Code Snippets:** Add relevant code blocks to each chapter, allowing for easy copying or review.
- **GitHub Export:** Creators can export the entire course, including notes and code snippets, to a new GitHub repository with a single click.

This turns a simple video into a structured, interactive course that promotes active learning.

## CodeTube Architecture

This document provides a high-level overview of the CodeTube application's architecture, including its frontend, backend, AI components, and user flow.

### Architecture

CodeTube is built on a modern, serverless architecture designed for scalability and rapid development.

- **Frontend:** A responsive web application built with **Next.js**, **React**, and **TypeScript**. Styling is handled by **Tailwind CSS** and **ShadCN UI** for a polished, component-based design.
- **Backend & Authentication:** **Firebase** is used for user authentication (Email/Password) and as a **Firestore** database to save user-created courses and chapters.
- **Generative AI:** AI features are powered by **Google's Gemini models** through the **Genkit** framework. This is used for generating chapter summaries and suggesting landing page improvements.
- **Hosting:** The application is deployed on **Firebase App Hosting**, providing a scalable, secure, and globally distributed environment.

### Technology Roles

It's important to understand the role of each major component in the stack:

- **Firebase Studio**: This is the integrated development environment (IDE) where we write, edit, and manage the application's code.
- **Genkit**: This is the open-source TypeScript framework we use to structure and orchestrate our AI logic. It helps us define `flows` that can call AI models, use tools, and return structured data.
- **Gemini API**: This is the actual generative model from Google that performs the AI tasks. Genkit calls the Gemini API to generate text, summarize content, translate, and more.
- **Firebase**: This is the suite of backend services providing the application's database (Firestore), user login system (Authentication), and deployment platform (App Hosting).

### API Usage

The application integrates with several external APIs to power its features:

| API Provider | Library Used | Core Features Powered |
| :--- | :--- | :--- |
| **Google (YouTube)** | `googleapis`, `youtube-transcript` | **Video & Transcript Import:** Fetches video titles, descriptions, and full transcripts. This is the foundation for all content analysis. |
| **GitHub** | `@octokit/rest` | **Export to GitHub:** Creates a new repository, generates Markdown files for the course, and pushes the content to the user's GitHub account. |
| **Judge0** | `axios` (within a Genkit flow) | **Interactive Code Execution:** Allows users to run code snippets directly within a chapter and see the output. |

#### AI Study Hub & In-App AI Features (Powered by Gemini API via Genkit)

Our core AI capabilities are custom-built flows that use the Gemini API. These are not third-party services but are integral to the CodeTube application.

- **Prompt API**: The fundamental capability to generate dynamic user prompts and get structured outputs. It supports multimodal input (image, audio) and is the basis for all other AI features.
- **Proofreader API**: Corrects grammar and spelling mistakes with ease. Used in the "AI Edit" feature within the Chapter Editor.
- **Summarizer API**: Distills complex information into clear insights. Used for the "Generate Summary" feature for each chapter.
- **Translator API**: Adds multilingual capabilities. Used automatically in the Pitch Feedback System if a non-English language is detected.
- **Writer API**: Creates original and engaging text from a prompt. Used in the "Write from Topic" feature in the Chapter Editor.
- **Rewriter API**: Improves content with alternative options and tones. Used in the "AI Edit" feature for chapter notes.
- **Quiz Generator**: Analyzes chapter transcripts to create multiple-choice questions. Used in the "Knowledge Check" section.
- **Interview Prep Generator**: Creates relevant technical interview questions based on chapter content. Used in the "Interview Prep" section.
- **Pitch Feedback System**: Analyzes a user's spoken answer (via audio) to an interview question and provides constructive feedback.
- **Code Explainer**: Generates a step-by-step explanation for a given code snippet.
- **Code Error Fixer**: Analyzes incorrect code and an error message to provide a corrected version.

### User Flow

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
