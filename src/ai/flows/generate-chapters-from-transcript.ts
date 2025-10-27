
'use server';

/**
 * @fileOverview A flow for generating structured chapters from a video description and transcript.
 *
 * - generateChaptersFromTranscript - A function that takes a video description and a full transcript,
 *   then returns structured chapters with segmented transcript entries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { TranscriptEntry } from '@/lib/types';

// Helper to convert HH:MM:SS or MM:SS to seconds
const timestampToSeconds = (ts: string): number => {
  const parts = ts.split(':').map(Number);
  let seconds = 0;
  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    seconds = parts[0];
  }
  return seconds;
};

const GenerateChaptersInputSchema = z.object({
  description: z.string().describe('The full description of the YouTube video, which may contain timestamps.'),
  transcript: z.array(z.object({
      text: z.string(),
      offset: z.number(),
      duration: z.number(),
  })).describe('The full transcript of the video.'),
});
export type GenerateChaptersInput = z.infer<typeof GenerateChaptersInputSchema>;

const ChapterSchema = z.object({
  id: z.string().describe('A unique identifier for the chapter.'),
  timestamp: z.string().describe('The original timestamp string, e.g., "1:23".'),
  title: z.string().describe('The title of the chapter.'),
  transcript: z.array(z.object({
    text: z.string(),
    offset: z.number(),
    duration: z.number(),
  })).describe('The transcript entries that belong to this chapter.'),
  summary: z.string().default(''),
  code: z.string().default(''),
  codeExplanation: z.string().default(''),
});

const GenerateChaptersOutputSchema = z.object({
  chapters: z.array(ChapterSchema).describe('An array of structured chapters.'),
});
export type GenerateChaptersOutput = z.infer<typeof GenerateChaptersOutputSchema>;


const extractChaptersPrompt = ai.definePrompt({
    name: 'extractChaptersFromDescription',
    input: { schema: z.object({ description: z.string() }) },
    output: { schema: z.object({
        chapters: z.array(z.object({
            timestamp: z.string().describe('The timestamp, e.g., "0:00" or "12:34".'),
            title: z.string().describe('The title of the chapter.'),
        }))
    })},
    prompt: `You are an expert at parsing video descriptions. Extract all chapters from the following text. A chapter is a line containing a timestamp.

    Description:
    \`\`\`
    {{{description}}}
    \`\`\`
    
    Return only the chapters with their timestamp and title.
    `,
});

export const generateChaptersFromTranscriptFlow = ai.defineFlow(
  {
    name: 'generateChaptersFromTranscriptFlow',
    inputSchema: GenerateChaptersInputSchema,
    outputSchema: GenerateChaptersOutputSchema,
  },
  async ({ description, transcript }) => {
    // Step 1: Use AI to extract chapter titles and timestamps from the description
    const { output } = await extractChaptersPrompt({ description });
    let chapterTimes = output?.chapters || [];

    // Step 2: Ensure there's at least a default chapter if none are found
    if (chapterTimes.length === 0 && transcript.length > 0) {
      chapterTimes.push({ timestamp: '0:00', title: 'Full Video Content' });
    } else if (chapterTimes.length > 0 && timestampToSeconds(chapterTimes[0].timestamp) !== 0) {
        // Add an "Introduction" chapter if the first chapter doesn't start at 0:00
        chapterTimes.unshift({ timestamp: '0:00', title: 'Introduction' });
    }

    // Step 3: Convert timestamps to seconds and determine end times
    const chaptersWithDurations = chapterTimes
      .map((chap, index) => ({
        ...chap,
        startTime: timestampToSeconds(chap.timestamp),
      }))
      .sort((a, b) => a.startTime - b.startTime)
      .map((chap, index, arr) => {
        const nextChap = arr[index + 1];
        const endTime = nextChap ? nextChap.startTime : Infinity;
        return {
          ...chap,
          endTime,
        };
      });

    // Step 4: Segment the transcript for each chapter
    const finalChapters = chaptersWithDurations.map((chap, index) => {
      const chapterTranscript: TranscriptEntry[] = transcript.filter(entry => {
        const entryStartSeconds = entry.offset / 1000;
        return entryStartSeconds >= chap.startTime && entryStartSeconds < chap.endTime;
      });

      return {
        id: `${Date.now()}-${index}`,
        title: chap.title,
        timestamp: chap.timestamp,
        transcript: chapterTranscript,
        summary: '',
        code: '',
        codeExplanation: '',
      };
    });

    return { chapters: finalChapters };
  }
);


export async function generateChaptersFromTranscript(input: GenerateChaptersInput): Promise<GenerateChaptersOutput> {
    return generateChaptersFromTranscriptFlow(input);
}
