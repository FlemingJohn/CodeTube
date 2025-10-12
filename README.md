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

## Architecture

CodeTube is built on a modern, serverless architecture designed for scalability and rapid development.

- **Frontend:** A responsive web application built with **Next.js**, **React**, and **TypeScript**. Styling is handled by **Tailwind CSS** and **ShadCN UI** for a polished, component-based design.
- **Backend & Authentication:** **Firebase** is used for user authentication (Email/Password) and as a **Firestore** database to save user-created courses and chapters.
- **Generative AI:** AI features are powered by **Google's Gemini models** through the **Genkit** framework. This is used for generating chapter summaries and suggesting landing page improvements.
- **Hosting:** The application is deployed on **Firebase App Hosting**, providing a scalable, secure, and globally distributed environment.

## User Flow

1.  **Landing Page:** New users arrive at a landing page that explains the product's features and benefits.
2.  **Authentication:** Users can **Sign Up** for a new account or **Sign In** to an existing one using their email and password.
3.  **Creator Studio:** After logging in, users are taken to the Creator Studio.
4.  **Import Video:** Users paste a YouTube video URL. The application fetches the video title and automatically detects any chapters listed in the video's description.
5.  **Edit Chapters:** Users can select individual chapters to edit. They can refine the title, add a code snippet, and use the AI feature to **generate a summary** of the chapter's transcript.
6.  **Export to GitHub:** Once the course is ready, the user can click "Export to GitHub," provide their username and a new repository name, and the app will create a public repository with the course content formatted in Markdown.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **AI:** [Genkit (Google's Gemini)](https://firebase.google.com/docs/genkit)
- **Database & Auth:** [Firebase (Firestore & Authentication)](https://firebase.google.com/)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/hosting)
- **Icons:** [Lucide React](https://lucide.dev/)
- **API Interaction:** [Octokit](https://github.com/octokit/rest.js) for GitHub API

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
