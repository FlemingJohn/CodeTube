
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
  if (!ts) return 0;
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
    
    Return only the chapters with their timestamp and title. If no chapters are found, return an empty array.
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
    } else if (chapterTimes.length > 0) {
        const firstTimestamp = chapterTimes[0]?.timestamp;
        // Ensure there's an intro chapter if the first real chapter doesn't start at 0:00
        if (firstTimestamp && timestampToSeconds(firstTimestamp) > 0) {
            chapterTimes.unshift({ timestamp: '0:00', title: 'Introduction' });
        }
    }

    // Step 3: Convert timestamps to seconds and create chapter shells.
    const sortedChapters = chapterTimes
      .map((chap, index) => ({
        id: `${Date.now()}-${index}`,
        timestamp: chap.timestamp,
        title: chap.title,
        startTime: timestampToSeconds(chap.timestamp),
        transcript: [] as TranscriptEntry[],
        summary: '',
        code: '',
        codeExplanation: '',
      }))
      .sort((a, b) => a.startTime - b.startTime);

    // Step 4: Use a merge-style algorithm to assign transcript entries to chapters.
    let transcriptIndex = 0;
    for (let i = 0; i < sortedChapters.length; i++) {
        const currentChapter = sortedChapters[i];
        // The end time of the current chapter is the start time of the next, or Infinity if it's the last chapter.
        const endTime = (i + 1 < sortedChapters.length) ? sortedChapters[i + 1].startTime : Infinity;

        // Walk through the transcript until we find an entry that's past the current chapter's end time.
        while (transcriptIndex < transcript.length) {
            const transcriptEntry = transcript[transcriptIndex];
            const entryStartSeconds = transcriptEntry.offset / 1000;

            if (entryStartSeconds < endTime) {
                // If the entry starts before the current chapter's end time, it belongs to this chapter.
                // We only need to check if it belongs, since the outer loop ensures we are in the right chapter timeframe.
                currentChapter.transcript.push(transcriptEntry);
                transcriptIndex++; // Move to the next transcript entry.
            } else {
                // This transcript entry belongs to a future chapter, so we break the inner loop
                // and the outer loop will advance to the next chapter.
                break;
            }
        }
    }

    return { chapters: sortedChapters };
  }
);


export async function generateChaptersFromTranscript(input: GenerateChaptersInput): Promise<GenerateChaptersOutput> {
    return generateChaptersFromTranscriptFlow(input);
}
