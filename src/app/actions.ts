
'use server';

import { generateChapterSummary } from '@/ai/flows/generate-chapter-summary';
import { suggestLandingPageImprovements } from '@/ai/flows/suggest-landing-page-improvements';
import { explainCode } from '@/ai/flows/explain-code';
import { youtubeSearch } from '@/ai/flows/youtube-search';
import { findCodeInTranscript } from '@/ai/flows/find-code-in-transcript';
import { Chapter } from '@/lib/types';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';

const generateSummarySchema = z.object({
  transcript: z.string(),
  chapterTitle: z.string(),
});

export async function handleGenerateSummary(values: z.infer<typeof generateSummarySchema>) {
  const validatedFields = generateSummarySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const result = await generateChapterSummary({ 
      transcript: validatedFields.data.transcript,
      chapterTitle: validatedFields.data.chapterTitle,
     });
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

const findCodeSchema = z.object({
  transcript: z.string(),
  chapterTitle: z.string(),
});

export async function handleFindCodeInTranscript(values: z.infer<typeof findCodeSchema>) {
    const validatedFields = findCodeSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields to find code.' };
    }
    
    // Return empty if transcript is missing, but don't show an error.
    if (!validatedFields.data.transcript) {
        return { code: '' }; 
    }

    try {
        const result = await findCodeInTranscript({ 
            transcript: validatedFields.data.transcript,
            chapterTitle: validatedFields.data.chapterTitle,
        });
        return { code: result.code };
    } catch (e) {
        console.error(e);
        // If AI fails, still return empty code so UI doesn't show an error
        return { code: '' };
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

function parseChaptersFromDescription(description: string, fullTranscript: Awaited<ReturnType<typeof YoutubeTranscript.fetchTranscript>>): Chapter[] {
    const chapters: Chapter[] = [];
    if (!description) return chapters;

    const lines = description.split('\n');
    const timestampRegex = /(?:(\d{1,2}:)?\d{1,2}:\d{2})/;

    const timestampToSeconds = (ts: string) => {
        const parts = ts.split(':').map(Number);
        if (parts.length === 3) { // hh:mm:ss
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) { // mm:ss
            return parts[0] * 60 + parts[1];
        }
        return 0;
    };

    let chapterData: { title: string; startTime: number; timestamp: string; }[] = [];

    lines.forEach((line) => {
        const match = line.match(timestampRegex);
        if (match) {
            const timestamp = match[0];
            const titleText = line.substring(line.indexOf(timestamp) + timestamp.length).trim();
            // Remove leading characters like -, ), ], etc.
            const title = titleText.replace(/^[\s\-–—)\]]+/, '');

            if (title) {
                chapterData.push({
                    title,
                    startTime: timestampToSeconds(timestamp),
                    timestamp,
                });
            }
        }
    });
    
    // Sort by start time to ensure correct order
    chapterData.sort((a, b) => a.startTime - b.startTime);
    
    const fullTranscriptText = fullTranscript.map(item => item.text).join(' ');

    if (chapterData.length === 0 && fullTranscript.length > 0) {
        // If no chapters found, treat the whole video as a single chapter
        const videoDuration = fullTranscript[fullTranscript.length - 1].offset / 1000 + fullTranscript[fullTranscript.length - 1].duration / 1000;
        
        chapters.push({
            id: `${Date.now()}-0`,
            timestamp: '00:00',
            title: 'Full Video Content',
            summary: '',
            code: '',
            codeExplanation: '',
            transcript: `Video Description:\n${description || ''}\n\nTranscript:\n${fullTranscriptText}` || 'No transcript available for this video.',
        });
        return chapters;
    }


    chapterData.forEach((currentChapter, index) => {
        const nextChapter = chapterData[index + 1];
        // Use video duration for the last chapter's end time if available
        const videoDuration = fullTranscript.length > 0 ? fullTranscript[fullTranscript.length - 1].offset / 1000 + fullTranscript[fullTranscript.length - 1].duration / 1000 : Infinity;
        const endTime = nextChapter ? nextChapter.startTime : videoDuration;

        const chapterTranscript = fullTranscript
            .filter(item => item.offset / 1000 >= currentChapter.startTime && item.offset / 1000 < endTime)
            .map(item => item.text)
            .join(' ');
        
        const fullContext = `Video Description:\n${description}\n\nTranscript for this chapter:\n${chapterTranscript}`;

        chapters.push({
            id: `${Date.now()}-${index}`,
            timestamp: currentChapter.timestamp,
            title: currentChapter.title,
            summary: '',
            code: '',
            codeExplanation: '',
            transcript: fullContext || `No transcript available for chapter: ${currentChapter.title}`,
        });
    });

    return chapters;
}


export async function getYoutubeChapters(videoId: string): Promise<{ chapters?: Chapter[], videoTitle?: string, error?: string, warning?: string }> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (!apiKey) {
    return { error: 'YouTube API key is not configured in environment variables.' };
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
    
    const videoResponse = await youtube.videos.list({
        part: ['snippet'],
        id: [videoId],
    });
    
    const video = videoResponse.data.items?.[0];
    if (!video || !video.snippet) {
      return { error: 'Video not found.' };
    }
    
    const videoTitle = video.snippet.title;
    const description = video.snippet.description;

    let transcriptResponse: Awaited<ReturnType<typeof YoutubeTranscript.fetchTranscript>> = [];
    let transcriptWarning: string | undefined = undefined;
    let transcriptError = false;

    try {
      transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      console.warn('Could not fetch transcript:', e);
      transcriptError = true;
    }

    const chapters = parseChaptersFromDescription(description || '', transcriptResponse);

    // Only warn if transcript fetch failed AND there are no chapters in the description
    if (transcriptError && chapters.length === 0) {
        transcriptWarning = "Could not get a transcript for this video. Code extraction may be less accurate.";
    }

    return { chapters, videoTitle, warning: transcriptWarning };

  } catch (error: any) {
    console.error('Error fetching from YouTube API:', error);
    if (error.message.includes('transcripts disabled')) {
         return { error: 'Transcripts are disabled for this video. Please choose another one.' };
    }
    return { error: error.message || 'Failed to fetch video data from YouTube API.' };
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

const youtubeSearchSchema = z.object({
    query: z.string().min(1, 'Search query is required.'),
});

export async function handleYoutubeSearch(values: z.infer<typeof youtubeSearchSchema>) {
    const validatedFields = youtubeSearchSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: 'Invalid search query.' };
    }
    
    try {
        const result = await youtubeSearch({ query: validatedFields.data.query });
        return { videos: result.videos };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to search YouTube.' };
    }
}
