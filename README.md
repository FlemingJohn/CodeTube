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

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/hosting)
- **Icons:** [Lucide React](https://lucide.dev/)

### API Usage

| API Provider | Library/SDK Used | Features Powered |
|---|---|---|
| **Google (YouTube)** | `googleapis`, `youtube-transcript` | Fetches video titles, descriptions, and transcripts for course creation. |
| **Google (Gemini)** | `@genkit-ai/google-genai` | Powers all generative AI features: chapter summaries, code explanations, quiz generation, interview prep, and the AI Study Hub (Proofreader, Explainer, Debugger, etc.). |
| **GitHub** | `@octokit/rest` | Creates new repositories and pushes course content as Markdown files when a user exports their course. |
| **Judge0** | `axios` (via Genkit flow) | Enables interactive code execution within chapters for multiple programming languages. |


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
