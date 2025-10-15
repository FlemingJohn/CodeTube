'use server';

/**
 * @fileOverview Generates a code snippet from a video transcript.
 *
 * - generateCodeFromTranscript - A function that generates code from a transcript.
 * - GenerateCodeFromTranscriptInput - The input type for the function.
 * - GenerateCodeFromTranscriptOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromTranscriptInputSchema = z.object({
  transcript: z.string().describe('The transcript of the video chapter.'),
});
export type GenerateCodeFromTranscriptInput = z.infer<
  typeof GenerateCodeFromTranscriptInputSchema
>;

const GenerateCodeFromTranscriptOutputSchema = z.object({
  code: z
    .string()
    .describe('The primary code snippet demonstrated in the transcript.'),
});
export type GenerateCodeFromTranscriptOutput = z.infer<
  typeof GenerateCodeFromTranscriptOutputSchema
>;

export async function generateCodeFromTranscript(
  input: GenerateCodeFromTranscriptInput
): Promise<GenerateCodeFromTranscriptOutput> {
  return generateCodeFromTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromTranscriptPrompt',
  input: {schema: GenerateCodeFromTranscriptInputSchema},
  output: {schema: GenerateCodeFromTranscriptOutputSchema},
  prompt: `You are an expert programmer who can extract relevant code from a video transcript.

  Analyze the following transcript and identify the main code snippet being demonstrated.
  Only return the code itself, without any explanations or markdown formatting.
  If no code is present, return an empty string.

  Transcript:
  \`\`\`
  {{{transcript}}}
  \`\`\`
  `,
});

const generateCodeFromTranscriptFlow = ai.defineFlow(
  {
    name: 'generateCodeFromTranscriptFlow',
    inputSchema: GenerateCodeFromTranscriptInputSchema,
    outputSchema: GenerateCodeFromTranscriptOutputSchema,
  },
  async input => {
    if (!input.transcript) {
      return {code: ''};
    }
    const {output} = await prompt(input);
    return output!;
  }
);
