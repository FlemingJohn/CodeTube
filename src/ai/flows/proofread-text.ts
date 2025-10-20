
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

const ProofreadTextInputSchema = z.object({
  text: z.string().describe('The text to be proofread.'),
});
type ProofreadTextInput = z.infer<typeof ProofreadTextInputSchema>;

const ProofreadTextOutputSchema = z.object({
  proofreadText: z.string().describe('The proofread version of the text.'),
});
type ProofreadTextOutput = z.infer<typeof ProofreadTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'proofreadTextPrompt',
  input: { schema: ProofreadTextInputSchema },
  output: { schema: ProofreadTextOutputSchema },
  prompt: `Proofread the following text, correcting any grammar and spelling mistakes. Only return the corrected text, without any introductory phrases:\n\n'{{{text}}}'`,
});

const proofreadTextFlow = ai.defineFlow(
  {
    name: 'proofreadTextFlow',
    inputSchema: ProofreadTextInputSchema,
    outputSchema: ProofreadTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return { proofreadText: output!.proofreadText };
  }
);

export async function proofreadText(
  input: ProofreadTextInput
): Promise<ProofreadTextOutput> {
  return proofreadTextFlow(input);
}
