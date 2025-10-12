'use server';

/**
 * @fileOverview Generates a summary for a given chapter of a course using AI.
 *
 * - generateChapterSummary - A function that generates the chapter summary.
 * - GenerateChapterSummaryInput - The input type for the generateChapterSummary function.
 * - GenerateChapterSummaryOutput - The return type for the generateChapterSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChapterSummaryInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the video chapter to summarize.'),
});
export type GenerateChapterSummaryInput = z.infer<
  typeof GenerateChapterSummaryInputSchema
>;

const GenerateChapterSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the chapter.'),
});
export type GenerateChapterSummaryOutput = z.infer<
  typeof GenerateChapterSummaryOutputSchema
>;

export async function generateChapterSummary(
  input: GenerateChapterSummaryInput
): Promise<GenerateChapterSummaryOutput> {
  return generateChapterSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChapterSummaryPrompt',
  input: {schema: GenerateChapterSummaryInputSchema},
  output: {schema: GenerateChapterSummaryOutputSchema},
  prompt: `You are an expert educator who can create concise chapter summaries.

  Generate a summary of the following transcript:

  Transcript: {{{transcript}}}
  `,
});

const generateChapterSummaryFlow = ai.defineFlow(
  {
    name: 'generateChapterSummaryFlow',
    inputSchema: GenerateChapterSummaryInputSchema,
    outputSchema: GenerateChapterSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
