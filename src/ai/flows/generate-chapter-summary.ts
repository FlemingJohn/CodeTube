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
import { summarizeText } from './summarize-text';

const GenerateChapterSummaryInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the video chapter to summarize.'),
  chapterTitle: z.string().describe('The title of the chapter.'),
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


const generateChapterSummaryFlow = ai.defineFlow(
  {
    name: 'generateChapterSummaryFlow',
    inputSchema: GenerateChapterSummaryInputSchema,
    outputSchema: GenerateChapterSummaryOutputSchema,
  },
  async input => {
    const prompt = `You are an expert educator who can create concise chapter notes in bullet points.

    Based on the chapter title and the provided transcript, generate a summary as a list of bullet points.
    Focus only on the key points relevant to the chapter title.
    
    Chapter Title: ${input.chapterTitle}
    Transcript: ${input.transcript}
    `
    const { summary } = await summarizeText({text: prompt})
    return { summary };
  }
);
