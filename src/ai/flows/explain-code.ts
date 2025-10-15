'use server';

/**
 * @fileOverview Generates an explanation for a code snippet using AI.
 *
 * - explainCode - A function that generates the code explanation.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to explain.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The generated explanation of the code snippet.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCode(
  input: ExplainCodeInput
): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: {schema: ExplainCodeInputSchema},
  output: {schema: ExplainCodeOutputSchema},
  prompt: `You are an expert programmer who can clearly explain code to beginners.

  Provide a step-by-step explanation for the following code snippet. Focus on clarity and simplicity.

  Code:
  \`\`\`
  {{{code}}}
  \`\`\`
  `,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async input => {
    if (!input.code) {
      return {explanation: 'No code provided.'};
    }
    const {output} = await prompt(input);
    return output!;
  }
);
