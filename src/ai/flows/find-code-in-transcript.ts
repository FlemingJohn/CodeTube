'use server';

/**
 * @fileOverview Extracts relevant code snippets from a video transcript for multiple chapters using a single AI call.
 *
 * - findCodeInTranscript - A function that handles the code extraction process for all chapters.
 * - FindCodeInTranscriptInput - The input type for the function.
 * - FindCodeInTranscriptOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChapterInfoSchema = z.object({
  id: z.string().describe('The unique identifier for the chapter.'),
  title: z.string().describe('The title of the chapter.'),
});

const FindCodeInTranscriptInputSchema = z.object({
  transcript: z.string().describe('The full video transcript and description text.'),
  chapters: z.array(ChapterInfoSchema).describe('An array of chapters to find code for.'),
});
export type FindCodeInTranscriptInput = z.infer<
  typeof FindCodeInTranscriptInputSchema
>;

const ChapterCodeSchema = z.object({
    chapterId: z.string().describe('The ID of the chapter this code belongs to.'),
    code: z.string().describe('The most relevant code snippet for this chapter. Return only the code. If no code is found, return an empty string.'),
});

const FindCodeInTranscriptOutputSchema = z.object({
  chapterCodeSnippets: z.array(ChapterCodeSchema).describe('An array of objects, each containing a chapter ID and its corresponding code snippet.'),
});
export type FindCodeInTranscriptOutput = z.infer<
  typeof FindCodeInTranscriptOutputSchema
>;

export async function findCodeInTranscript(
  input: FindCodeInTranscriptInput
): Promise<FindCodeInTranscriptOutput> {
  return findCodeInTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findCodeInTranscriptPrompt',
  input: {schema: FindCodeInTranscriptInputSchema},
  output: {schema: FindCodeInTranscriptOutputSchema},
  prompt: `You are an expert programmer tasked with extracting code from a video's content for multiple chapters at once.

  You have been provided with the full video content (description and transcript) and a list of chapters.
  For each chapter in the provided list, your task is to:
  1.  Analyze the full text content to find the most relevant and complete code snippet related to that specific chapter's title.
  2.  Prioritize finding code in the video description first, especially if it contains GitHub links or formatted code blocks.
  3.  If no relevant code is in the description for a chapter, analyze the transcript to find the code discussed during that chapter's timeframe.
  4.  Return an array of objects. Each object must contain the original 'chapterId' and the 'code' you found for it.
  5.  For the 'code' property, return only the code itself. Do not include any explanations, surrounding text, or markdown formatting like \`\`\`.
  6.  If you are absolutely certain no code is present for a specific chapter, return an empty string for its 'code' property.

  Content to analyze:
  \`\`\`
  {{{transcript}}}
  \`\`\`

  Chapters to find code for:
  {{#each chapters}}
  - Chapter ID: {{this.id}}, Title: "{{this.title}}"
  {{/each}}
  `,
});

const findCodeInTranscriptFlow = ai.defineFlow(
  {
    name: 'findCodeInTranscriptFlow',
    inputSchema: FindCodeInTranscriptInputSchema,
    outputSchema: FindCodeInTranscriptOutputSchema,
  },
  async input => {
    if (!input.transcript || input.chapters.length === 0) {
      return { chapterCodeSnippets: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
