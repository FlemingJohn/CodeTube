'use server';

/**
 * @fileOverview AI-powered landing page improvement suggestions.
 *
 * - suggestLandingPageImprovements - A function that takes landing page content and suggests improvements.
 * - SuggestLandingPageImprovementsInput - The input type for the suggestLandingPageImprovements function.
 * - SuggestLandingPageImprovementsOutput - The return type for the suggestLandingPageImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLandingPageImprovementsInputSchema = z.object({
  landingPageContent: z
    .string()
    .describe('The HTML content of the course landing page.'),
});
export type SuggestLandingPageImprovementsInput = z.infer<
  typeof SuggestLandingPageImprovementsInputSchema
>;

const SuggestLandingPageImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'AI-powered suggestions for improving the landing page content, including optimizing for engagement and conversions.'
    ),
});
export type SuggestLandingPageImprovementsOutput = z.infer<
  typeof SuggestLandingPageImprovementsOutputSchema
>;

export async function suggestLandingPageImprovements(
  input: SuggestLandingPageImprovementsInput
): Promise<SuggestLandingPageImprovementsOutput> {
  return suggestLandingPageImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLandingPageImprovementsPrompt',
  input: {schema: SuggestLandingPageImprovementsInputSchema},
  output: {schema: SuggestLandingPageImprovementsOutputSchema},
  prompt: `You are an AI expert in landing page optimization. Analyze the following landing page content and provide suggestions for improvement.

Landing Page Content:
{{{landingPageContent}}}

Suggestions:
`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestLandingPageImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestLandingPageImprovementsFlow',
    inputSchema: SuggestLandingPageImprovementsInputSchema,
    outputSchema: SuggestLandingPageImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
