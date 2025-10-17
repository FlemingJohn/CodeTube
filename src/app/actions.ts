'use server';

import { generateChapterSummary } from '@/ai/flows/generate-chapter-summary';
import { suggestLandingPageImprovements } from '@/ai/flows/suggest-landing-page-improvements';
import { explainCode } from '@/ai/flows/explain-code';
import { Chapter } from '@/lib/types';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { google } from 'googleapis';

const generateSummarySchema = z.object({
  transcript: z.string(),
});

export async function handleGenerateSummary(values: z.infer<typeof generateSummarySchema>) {
  const validatedFields = generateSummarySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const result = await generateChapterSummary({ transcript: validatedFields.data.transcript });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate summary. Please try again.' };
  }
}

const explainCodeSchema = z.object({
  code: z.string(),
});

export async function handleExplainCode(values: z.infer<typeof explainCodeSchema>) {
  const validatedFields = explainCodeSchema.safeParse(values);

  if (!validatedFields.success || !validatedFields.data.code) {
    return { error: 'Invalid fields: Code cannot be empty.' };
  }

  try {
    const result = await explainCode({ code: validatedFields.data.code });
    return { explanation: result.explanation };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to explain code. Please try again.' };
  }
}

const suggestImprovementsSchema = z.object({
  htmlContent: z.string(),
});

export async function handleSuggestImprovements(values: z.infer<typeof suggestImprovementsSchema>) {
  const validatedFields = suggestImprovementsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }
  
  if (!validatedFields.data.htmlContent) {
    return { error: 'Landing page content cannot be empty.' };
  }

  try {
    const result = await suggestLandingPageImprovements({ landingPageContent: validatedFields.data.htmlContent });
    return { suggestions: result.suggestions };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate suggestions. Please try again.' };
  }
}

function parseChaptersFromDescription(description: string): Chapter[] {
    const chapters: Chapter[] = [];
    if (!description) return chapters;

    const lines = description.split('\n');
    // Regex to find timestamps like 00:00, 0:00, 00:00:00, (0:00), [0:00]
    const timestampRegex = /(?:(\d{1,2}:)?\d{1,2}:\d{2})/;
    const chapterLineRegex = /([\(\[]?)((?:\d{1,2}:)?\d{1,2}:\d{2})([\)\]]?)/;


    lines.forEach((line, index) => {
        const match = line.match(chapterLineRegex);

        if (match) {
            const timestamp = match[2];
            let title = line.substring(line.indexOf(timestamp) + timestamp.length).trim();

            // Clean up common leading characters for titles
            title = title.replace(/^[\s\-)\]]+/, '');
            
            // Sometimes there's no title on the same line, just the timestamp. We'll ignore those for now.
            if (title) {
                chapters.push({
                    id: `${Date.now()}-${index}`, // More unique ID
                    timestamp,
                    title,
                    summary: '',
                    code: '',
                    codeExplanation: '',
                    transcript: `Placeholder transcript for chapter: ${title}`,
                });
            }
        }
    });

    return chapters;
}


export async function getYoutubeChapters(videoId: string): Promise<{ chapters?: Chapter[], videoTitle?: string, error?: string }> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (!apiKey) {
    return { error: 'YouTube API key is not configured in environment variables.' };
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });

    const response = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video || !video.snippet) {
      return { error: 'Video not found.' };
    }
    
    const videoTitle = video.snippet.title;
    const description = video.snippet.description;

    if (!description) {
      // Return title even if there's no description for manual chapter creation
      return { chapters: [], videoTitle };
    }

    const chapters = parseChaptersFromDescription(description);

    return { chapters, videoTitle };
  } catch (error: any) {
    console.error('Error fetching from YouTube API:', error);
    return { error: error.message || 'Failed to fetch chapters from YouTube API.' };
  }
}

const githubExportSchema = z.object({
  githubUsername: z.string().min(1, 'GitHub username is required.'),
  repoName: z.string().min(1, 'Repository name is required.'),
  chapters: z.array(z.any()),
  courseTitle: z.string().default('My CodeTube Course'),
});

function chapterToMarkdown(chapter: Chapter) {
  let content = `## ${chapter.title} (${chapter.timestamp})\n\n`;
  if (chapter.summary) {
    content += `### AI-Generated Summary\n${chapter.summary}\n\n`;
  }
  if (chapter.code) {
    content += `### Code Snippet\n\`\`\`javascript\n${chapter.code}\n\`\`\`\n`;
  }
  if (chapter.codeExplanation) {
    content += `### Code Explanation\n${chapter.codeExplanation}\n\n`;
  }
  return content;
}

export async function handleGithubExport(values: z.infer<typeof githubExportSchema>) {
  const validatedFields = githubExportSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields for GitHub export.' };
  }

  const { githubUsername, repoName, chapters, courseTitle } = validatedFields.data;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { error: 'GitHub token is not configured in environment variables.' };
  }

  const octokit = new Octokit({ auth: token });

  try {
    // 1. Create a new repository
    const repo = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: `CodeTube Course: ${courseTitle}`,
      private: false, 
    });

    const owner = repo.data.owner.login;

    // 2. Create a README.md file
    const readmeContent = `# ${courseTitle}\n\nThis course was generated using CodeTube.`;
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: 'README.md',
      message: 'Initial commit: Add README',
      content: Buffer.from(readmeContent).toString('base64'),
    });

    // 3. Create a file for each chapter
    for (const chapter of chapters) {
      const markdownContent = chapterToMarkdown(chapter);
      const fileName = `${chapter.timestamp.replace(/:/g, '-')}-${chapter.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: `chapters/${fileName}`,
        message: `Add chapter: ${chapter.title}`,
        content: Buffer.from(markdownContent).toString('base64'),
      });
    }

    return { success: `Successfully created and pushed to ${repo.data.html_url}` };

  } catch (error: any) {
    console.error('GitHub Export Error:', error);
    return { error: error.message || 'Failed to export to GitHub.' };
  }
}
