
'use server';

import { generateChapterSummary } from '@/ai/flows/generate-chapter-summary';
import { suggestLandingPageImprovements } from '@/ai/flows/suggest-landing-page-improvements';
import { explainCode } from '@/ai/flows/explain-code';
import { findCodeInTranscript } from '@/ai/flows/find-code-in-transcript';
import { youtubeSearch } from '@/ai/flows/youtube-search';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { generatePitchScenario } from '@/ai/flows/generate-pitch-scenario';
import { getPitchFeedback } from '@/ai/flows/get-pitch-feedback';
import { runCode } from '@/ai/flows/judge0-flow';
import { fixCodeError } from '@/ai/flows/fix-code-error';
import { suggestVideos } from '@/ai/flows/suggest-videos-flow';
import { speechToText } from '@/ai/flows/speech-to-text';
import { summarizeText } from '@/ai/flows/summarize-text';
import { translateText } from '@/aiflows/translate-text';
import { proofreadText } from '@/ai/flows/proofread-text';
import { rewriteText } from '@/ai/flows/rewrite-text';
import { writeText } from '@/ai/flows/write-text';
import { generateLearningPlan, compareVideos } from '@/ai/flows/generate-learning-plan';

import { Chapter } from '@/lib/types';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';
import { config } from 'dotenv';


config();

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

async function parseChaptersFromDescription(description: string, fullTranscript: Awaited<ReturnType<typeof YoutubeTranscript.fetchTranscript>>): Promise<Chapter[]> {
    const lines = (description || '').split('\n');
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

    let chapterData: { id: string; title: string; startTime: number; timestamp: string; }[] = [];

    lines.forEach((line, index) => {
        const match = line.match(timestampRegex);
        if (match) {
            const timestamp = match[0];
            const title = line.substring(line.indexOf(timestamp) + timestamp.length).replace(/^[\s\-–—)\]]+/, '').trim();
            if (title) {
                chapterData.push({
                    id: `${Date.now()}-${index}`,
                    title,
                    startTime: timestampToSeconds(timestamp),
                    timestamp,
                });
            }
        }
    });

    chapterData.sort((a, b) => a.startTime - b.startTime);

    let chapters: Chapter[] = [];
    const fullTranscriptText = fullTranscript.map(item => item.text).join(' ');

    if (chapterData.length > 0) {
        // Prepare data for single AI call
        const chapterInfoForAi = chapterData.map(c => ({ id: c.id, title: c.title }));
        const fullContextForAi = `Video Description:\n${description || 'No description provided.'}\n\nFull Transcript:\n${fullTranscriptText || 'No transcript available.'}`;

        const codeSnippetsResult = await findCodeInTranscript({
            transcript: fullContextForAi,
            chapters: chapterInfoForAi,
        });

        const codeMap = new Map(codeSnippetsResult.chapterCodeSnippets.map(cs => [cs.chapterId, cs.code]));
        
        for (const [index, currentChapter] of chapterData.entries()) {
            const nextChapter = chapterData[index + 1];
            const videoDuration = fullTranscript.length > 0 ? (fullTranscript[fullTranscript.length - 1].offset + fullTranscript[fullTranscript.length - 1].duration) / 1000 : Infinity;
            const endTime = nextChapter ? nextChapter.startTime : videoDuration;

            const chapterTranscript = fullTranscript
                .filter(item => (item.offset / 1000) >= currentChapter.startTime && (item.offset / 1000) < endTime)
                .map(item => item.text)
                .join(' ');

            chapters.push({
                id: currentChapter.id,
                timestamp: currentChapter.timestamp,
                title: currentChapter.title,
                summary: '',
                code: codeMap.get(currentChapter.id) || '',
                codeExplanation: '',
                transcript: chapterTranscript,
            });
        }
    } else if (fullTranscript.length > 0) {
        const chapterId = `${Date.now()}-0`;
        const codeSnippetsResult = await findCodeInTranscript({
            transcript: fullTranscriptText,
            chapters: [{ id: chapterId, title: 'Full Video Content' }],
        });

        const codeSnippet = codeSnippetsResult.chapterCodeSnippets[0]?.code || '';

        chapters.push({
            id: chapterId,
            timestamp: '00:00',
            title: 'Full Video Content',
            summary: '',
            code: codeSnippet,
            codeExplanation: '',
            transcript: fullTranscriptText,
        });
    }
    
    return chapters;
}


export async function getYoutubeChapters(videoId: string): Promise<{ chapters?: Chapter[], videoTitle?: string, error?: string, warning?: string }> {
  const apiKey = process.env.YOUTUBE_API_KEY;

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
    let transcriptError = false;
    let transcriptWarning: string | undefined;

    try {
      transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      console.warn('Could not fetch transcript for video:', videoId, e);
      transcriptError = true;
    }

    const chapters = await parseChaptersFromDescription(description || '', transcriptResponse);

    if (transcriptError && chapters.length === 0) {
        transcriptWarning = "Could not get a transcript for this video. AI features will be limited.";
    }

    return { chapters, videoTitle, warning: transcriptWarning };

  } catch (error: any) {
    console.error('Error fetching from YouTube API:', error);
    if (error.response?.data?.error?.message) {
      return { error: error.response.data.error.message }
    }
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
    content += `### Chapter Notes\n${chapter.summary}\n\n`;
  }
  
  if (chapter.code) {
    content += `### Code Snippet\n\`\`\`javascript\n${chapter.code}\n\`\`\`\n\n`;
  }

  if (chapter.codeExplanation) {
    content += `### AI Code Explanation\n${chapter.codeExplanation}\n\n`;
  }

  if (chapter.quiz && chapter.quiz.length > 0) {
    content += `### Knowledge Check\n\n`;
    chapter.quiz.forEach((q, index) => {
      content += `${index + 1}. **${q.question}**\n`;
      q.options.forEach(opt => {
        content += `   - \`${opt}\`\n`;
      });
      content += `\n   *Answer: \`${q.answer}\`*\n\n`;
    });
  }

  if (chapter.interviewQuestions && chapter.interviewQuestions.length > 0) {
    content += `### Interview Prep\n\n`;
    chapter.interviewQuestions.forEach((iq, index) => {
      content += `**Question ${index + 1}: ${iq.question}**\n\n`;
      content += `**Answer:**\n${iq.answer}\n\n`;
    });
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

const generateQuizSchema = z.object({
    transcript: z.string(),
    chapterTitle: z.string(),
});

export async function handleGenerateQuiz(values: z.infer<typeof generateQuizSchema>) {
    const validatedFields = generateQuizSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: 'Invalid fields for quiz generation.' };
    }
    
    try {
        const result = await generateQuiz(validatedFields.data);
        return { questions: result.questions };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to generate quiz.' };
    }
}

const generateInterviewQuestionsSchema = z.object({
    transcript: z.string(),
    chapterTitle: z.string(),
});

export async function handleGenerateInterviewQuestions(values: z.infer<typeof generateInterviewQuestionsSchema>) {
    const validatedFields = generateInterviewQuestionsSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: 'Invalid fields for interview question generation.' };
    }
    
    try {
        const result = await generateInterviewQuestions(validatedFields.data);
        return { questions: result.questions };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to generate interview questions.' };
    }
}

const generatePitchScenarioSchema = z.object({
    courseTitle: z.string(),
    courseContent: z.string(),
});

export async function handleGeneratePitchScenario(values: z.infer<typeof generatePitchScenarioSchema>) {
    const validatedFields = generatePitchScenarioSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const result = await generatePitchScenario(validatedFields.data);
        return { scenario: result.scenario };
    } catch (e: any) {
        console.error(e);
        return { error: 'Failed to generate pitch scenario. Please try again.' };
    }
}

const getPitchFeedbackSchema = z.object({
    scenario: z.string(),
    userAnswer: z.string(),
});

export async function handleGetPitchFeedback(values: z.infer<typeof getPitchFeedbackSchema>) {
    const validatedFields = getPitchFeedbackSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const result = await getPitchFeedback(validatedFields.data);
        return { feedback: result };
    } catch (e: any) {
        console.error(e);
        return { error: 'Failed to get pitch feedback. Please try again.' };
    }
}

const runCodeSchema = z.object({
  source_code: z.string(),
  language_id: z.number(),
});

export async function handleRunCode(values: z.infer<typeof runCodeSchema>) {
    const validatedFields = runCodeSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const result = await runCode(validatedFields.data);
        // The result now has a more complex structure, so we pass it all back.
        return { result };
    } catch (e: any) {
        console.error(e);
        // Ensure we pass back an object with an 'error' key that matches the client expectation.
        return { error: e.message || 'Failed to run code.' };
    }
}

const fixCodeErrorSchema = z.object({
  code: z.string(),
  error: z.string(),
});

export async function handleFixCodeError(values: z.infer<typeof fixCodeErrorSchema>) {
    const validatedFields = fixCodeErrorSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const result = await fixCodeError(validatedFields.data);
        return { fixedCode: result.fixedCode, explanation: result.explanation };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to fix code.' };
    }
}

const suggestVideosSchema = z.object({
    query: z.string(),
});

export async function handleSuggestVideos(values: z.infer<typeof suggestVideosSchema>) {
    const validatedFields = suggestVideosSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid fields' };
    try {
        const result = await suggestVideos(validatedFields.data);
        return { suggestions: result };
    } catch (e: any) {
        return { error: e.message || 'Failed to suggest videos.' };
    }
}

const speechToTextSchema = z.object({
    audioDataUri: z.string(),
});

export async function handleSpeechToText(values: z.infer<typeof speechToTextSchema>) {
    const validatedFields = speechToTextSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid fields' };
    try {
        const result = await speechToText(validatedFields.data);
        return { text: result.text };
    } catch (e: any) {
        return { error: e.message || 'Failed to transcribe audio.' };
    }
}

export async function handleTranslateText(text: string, targetLanguage: string) {
    try {
        const result = await translateText({ text, targetLanguage });
        return { translatedText: result.translatedText };
    } catch (e: any) {
        return { error: e.message || 'Failed to translate text.' };
    }
}

export async function handleProofreadText(text: string) {
    try {
        const result = await proofreadText({ text });
        return { proofreadText: result.proofreadText };
    } catch (e: any) {
        return { error: e.message || 'Failed to proofread text.' };
    }
}

export async function handleRewriteText(text: string, tone?: string) {
    try {
        const result = await rewriteText({ text, tone });
        return { rewrittenText: result.rewrittenText };
    } catch (e: any) {
        return { error: e.message || 'Failed to rewrite text.' };
    }
}

export async function handleWriteText(prompt: string) {
    try {
        const result = await writeText({ prompt });
        return { writtenText: result.writtenText };
    } catch (e: any) {
        return { error: e.message || 'Failed to write text.' };
    }
}

const generateLearningPlanSchema = z.object({
    topic: z.string(),
});

export async function handleGenerateLearningPlan(values: z.infer<typeof generateLearningPlanSchema>) {
    const validatedFields = generateLearningPlanSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid fields' };
    try {
        const result = await generateLearningPlan(validatedFields.data);
        return { plan: result };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to generate learning plan.' };
    }
}

const compareVideosSchema = z.object({
    topic: z.string(),
    videos: z.array(z.object({
        id: z.string(),
        title: z.string(),
        channelTitle: z.string(),
    })),
});

export async function handleCompareVideos(values: z.infer<typeof compareVideosSchema>) {
    const validatedFields = compareVideosSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid fields' };
    try {
        const result = await compareVideos(validatedFields.data);
        return { comparison: result.comparison };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to compare videos.' };
    }
}
