'use server';

/**
 * @fileOverview Extracts a relevant code snippet from a video transcript using AI.
 *
 * - findCodeInTranscript - A function that handles the code extraction process.
 * - FindCodeInTranscriptInput - The input type for the findCodeInTranscript function.
 * - FindCodeInTranscriptOutput - The return type for the findCodeInTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindCodeInTranscriptInputSchema = z.object({
  transcript: z.string().describe('A snippet of a video transcript.'),
  chapterTitle: z.string().describe('The title of the chapter.'),
});
export type FindCodeInTranscriptInput = z.infer<
  typeof FindCodeInTranscriptInputSchema
>;

const FindCodeInTranscriptOutputSchema = z.object({
  code: z
    .string()
    .describe(
      'The most relevant code snippet found in the transcript. Return only the code.'
    ),
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
  prompt: `You are an expert programmer tasked with extracting code from a video transcript.

  The title of the chapter is: "{{chapterTitle}}".

  Analyze the following transcript and extract the most relevant and complete code snippet related to the chapter title.
  - Return your best guess for the most relevant code snippet.
  - Only return the code itself. Do not include any explanations or surrounding text.
  - If you are absolutely certain no code is present, return an empty string.

  Transcript:
  \`\`\`
  {{{transcript}}}
  \`\`\`
  `,
});

const findCodeInTranscriptFlow = ai.defineFlow(
  {
    name: 'findCodeInTranscriptFlow',
    inputSchema: FindCodeInTranscriptInputSchema,
    outputSchema: FindCodeInTranscriptOutputSchema,
  },
  async input => {
    if (!input.transcript) {
      return {code: ''};
    }
    const {output} = await prompt(input);
    return output!;
  }
);
