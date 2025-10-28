
'use server';

/**
 * @fileOverview A flow for generating structured chapters from a video description.
 * It uses AI to extract timestamps and titles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateChaptersInputSchema = z.object({
  description: z.string().describe('The full description of the YouTube video, which may contain timestamps.'),
});
export type GenerateChaptersInput = z.infer<typeof GenerateChaptersInputSchema>;

const ChapterSchema = z.object({
  timestamp: z.string().describe('The original timestamp string, e.g., "1:23".'),
  title: z.string().describe('The title of the chapter.'),
});

const GenerateChaptersOutputSchema = z.object({
  chapters: z.array(ChapterSchema).describe('An array of structured chapters extracted from the description.'),
});
export type GenerateChaptersOutput = z.infer<typeof GenerateChaptersOutputSchema>;


const extractChaptersPrompt = ai.definePrompt({
    name: 'extractChaptersFromDescription',
    input: { schema: z.object({ description: z.string() }) },
    output: { schema: GenerateChaptersOutputSchema },
    prompt: `You are an expert at parsing video descriptions. Extract all chapters from the following text. A chapter is a line containing a timestamp (e.g., "0:00", "12:34").

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
  async ({ description }) => {
    // Step 1: Use AI to extract chapter titles and timestamps from the description
    const { output } = await extractChaptersPrompt({ description });
    
    if (!output || output.chapters.length === 0) {
        return { chapters: [{ timestamp: '0:00', title: 'Full Video Content' }] };
    }

    return { chapters: output.chapters };
  }
);


export async function generateChaptersFromTranscript(input: GenerateChaptersInput): Promise<GenerateChaptersOutput> {
    return generateChaptersFromTranscriptFlow(input);
}
