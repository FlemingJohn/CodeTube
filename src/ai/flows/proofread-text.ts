
'use server';

/**
 * @fileOverview A flow for proofreading text using AI.
 *
 * - proofreadText - A function that handles the text proofreading process.
 * - ProofreadTextInput - The input type for the function.
 * - ProofreadTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ProofreadTextInputSchema = z.object({
  text: z.string().describe('The text to be proofread.'),
});
export type ProofreadTextInput = z.infer<typeof ProofreadTextInputSchema>;

export const ProofreadTextOutputSchema = z.object({
  correctedText: z.string().describe('The corrected version of the text.'),
});
export type ProofreadTextOutput = z.infer<typeof ProofreadTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'proofreadTextPrompt',
  input: { schema: ProofreadTextInputSchema },
  output: { schema: ProofreadTextOutputSchema },
  prompt: `You are an expert proofreader. Correct any grammar and spelling mistakes in the following text.
  Return only the corrected text.

  Text to correct:
  \`\`\`
  {{{text}}}
  \`\`\`
  `,
});

const proofreadTextFlow = ai.defineFlow(
  {
    name: 'proofreadTextFlow',
    inputSchema: ProofreadTextInputSchema,
    outputSchema: ProofreadTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function proofreadText(
  input: ProofreadTextInput
): Promise<ProofreadTextOutput> {
  return proofreadTextFlow(input);
}
