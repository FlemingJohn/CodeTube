
'use server';

/**
 * @fileOverview A flow for translating text using AI.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the function.
 * - TranslateTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The language to translate the text into.'),
});
type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated version of the text.'),
});
type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `You are an expert translator. Translate the following text into {{targetLanguage}}.
  Return only the translated text.

  Text to translate:
  \`\`\`
  {{{text}}}
  \`\`\`
  `,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}
