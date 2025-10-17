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
  transcript: z.string().describe('A snippet of a video transcript, which may also include the full video description.'),
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
  prompt: `You are an expert programmer tasked with extracting code from a video's content.

  The user has provided you with the video's description and the transcript for a specific chapter titled: "{{chapterTitle}}".

  Your task is to analyze all the provided text and extract the most relevant and complete code snippet related to the chapter title.
  - First, check the video description for GitHub links or code blocks. This is often the best source.
  - If no code is in the description, analyze the chapter transcript.
  - Return your best guess for the most relevant code snippet.
  - Only return the code itself. Do not include any explanations, surrounding text, or markdown formatting like \`\`\`.
  - If you are absolutely certain no code is present in either the description or the transcript, return an empty string.

  Content to analyze:
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
