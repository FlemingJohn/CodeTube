
'use server';

/**
 * @fileOverview A flow for rewriting text using AI.
 *
 * - rewriteText - A function that handles the text rewriting process.
 * - RewriteTextInput - The input type for the function.
 * - RewriteTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RewriteTextInputSchema = z.object({
  text: z.string().describe('The text to be rewritten.'),
  tone: z.string().optional().describe('The desired tone for the rewritten text (e.g., Explanatory, Concise).'),
});
type RewriteTextInput = z.infer<typeof RewriteTextInputSchema>;

const RewriteTextOutputSchema = z.object({
  rewrittenText: z.string().describe('The rewritten version of the text.'),
});
type RewriteTextOutput = z.infer<typeof RewriteTextOutputSchema>;

const rewriteTextFlow = ai.defineFlow(
  {
    name: 'rewriteTextFlow',
    inputSchema: RewriteTextInputSchema,
    outputSchema: RewriteTextOutputSchema,
  },
  async ({ text, tone }) => {
    const promptText = `Rewrite the following text to improve its clarity and flow. ${tone ? `Adapt to a ${tone} tone.` : ''} Only return the rewritten text, without any introductory phrases:\n\n'${text}'`;

    const prompt = ai.definePrompt({
        name: 'rewriteTextPrompt',
        output: { schema: RewriteTextOutputSchema },
        prompt: promptText,
    });
    
    const { output } = await prompt();
    return { rewrittenText: output!.rewrittenText };
  }
);

export async function rewriteText(
  input: RewriteTextInput
): Promise<RewriteTextOutput> {
  return rewriteTextFlow(input);
}
