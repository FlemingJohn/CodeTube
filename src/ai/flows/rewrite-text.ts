
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

export const RewriteTextInputSchema = z.object({
  text: z.string().describe('The text to be rewritten.'),
  tone: z.string().optional().describe('The desired tone for the rewritten text (e.g., professional, casual, confident).'),
});
export type RewriteTextInput = z.infer<typeof RewriteTextInputSchema>;

export const RewriteTextOutputSchema = z.object({
  rewrittenText: z.string().describe('The rewritten version of the text.'),
});
export type RewriteTextOutput = z.infer<typeof RewriteTextOutputSchema>;


const prompt = ai.definePrompt({
  name: 'rewriteTextPrompt',
  input: { schema: RewriteTextInputSchema },
  output: { schema: RewriteTextOutputSchema },
  prompt: `You are an expert writer. Rewrite the following text to improve its clarity, engagement, and flow.
  {{#if tone}}
  Adapt the text to have a {{tone}} tone.
  {{/if}}
  Return only the rewritten text.

  Original text:
  \`\`\`
  {{{text}}}
  \`\`\`
  `,
});


const rewriteTextFlow = ai.defineFlow(
  {
    name: 'rewriteTextFlow',
    inputSchema: RewriteTextInputSchema,
    outputSchema: RewriteTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function rewriteText(
  input: RewriteTextInput
): Promise<RewriteTextOutput> {
  return rewriteTextFlow(input);
}
