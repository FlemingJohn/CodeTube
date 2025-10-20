
'use server';

/**
 * @fileOverview A flow for summarizing text using AI.
 *
 * - summarizeText - A function that handles the text summarization process.
 * - SummarizeTextInput - The input type for the function.
 * - SummarizeTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text to be summarized.'),
});
type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('The summarized version of the text.'),
});
type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: { schema: SummarizeTextInputSchema },
  output: { schema: SummarizeTextOutputSchema },
  prompt: `You are an expert summarizer. Distill the following complex information into clear and concise insights.

  Text to summarize:
  \`\`\`
  {{{text}}}
  \`\`\`
  `,
});

const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function summarizeText(
  input: SummarizeTextInput
): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}
