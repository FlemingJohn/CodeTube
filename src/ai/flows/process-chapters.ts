
'use server';

/**
 * @fileOverview Processes a video's transcript to extract a summary and relevant code snippet for multiple chapters at once.
 *
 * - processChapters - A function that handles the content extraction process for all chapters.
 * - ProcessChaptersInput - The input type for the function.
 * - ProcessChaptersOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChapterInfoSchema = z.object({
  id: z.string().describe('The unique identifier for the chapter (e.g., its timestamp).'),
  title: z.string().describe('The title of the chapter.'),
});

const ProcessChaptersInputSchema = z.object({
  transcript: z.string().describe('The full video transcript.'),
  chapters: z.array(ChapterInfoSchema).describe('An array of chapters to process.'),
});
export type ProcessChaptersInput = z.infer<
  typeof ProcessChaptersInputSchema
>;

const ProcessedChapterSchema = z.object({
    chapterId: z.string().describe('The ID of the chapter this content belongs to.'),
    summary: z.string().describe('A concise, bullet-point summary of the chapter\'s content.'),
    code: z.string().describe('The most relevant code snippet for this chapter. Return only the code. If no code is found, return an empty string.'),
});

const ProcessChaptersOutputSchema = z.object({
  processedChapters: z.array(ProcessedChapterSchema).describe('An array of objects, each containing a chapter ID, its summary, and its code snippet.'),
});
export type ProcessChaptersOutput = z.infer<
  typeof ProcessChaptersOutputSchema
>;

export async function processChapters(
  input: ProcessChaptersInput
): Promise<ProcessChaptersOutput> {
  return processChaptersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processChaptersPrompt',
  input: {schema: ProcessChaptersInputSchema},
  output: {schema: ProcessChaptersOutputSchema},
  prompt: `You are an expert programmer and educator tasked with processing a video's content for multiple chapters at once.

  You have been provided with the full video transcript and a list of chapters.
  For each chapter in the provided list, your task is to:
  1.  Analyze the full transcript to understand the content related to that specific chapter's title.
  2.  Generate a concise summary for the chapter in bullet points.
  3.  Find the most relevant and complete code snippet discussed during that chapter's timeframe.
  4.  Return an array of objects. Each object must contain the original 'chapterId', the 'summary' you generated, and the 'code' you found.
  5.  For the 'code' property, return only the code itself. Do not include any explanations, surrounding text, or markdown formatting like \`\`\`.
  6.  If you are absolutely certain no code is present for a specific chapter, return an empty string for its 'code' property.

  Full Transcript:
  \`\`\`
  {{{transcript}}}
  \`\`\`

  Chapters to process:
  {{#each chapters}}
  - Chapter ID: {{this.id}}, Title: "{{this.title}}"
  {{/each}}
  `,
});

const processChaptersFlow = ai.defineFlow(
  {
    name: 'processChaptersFlow',
    inputSchema: ProcessChaptersInputSchema,
    outputSchema: ProcessChaptersOutputSchema,
  },
  async input => {
    if (!input.transcript || input.chapters.length === 0) {
      return { processedChapters: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
