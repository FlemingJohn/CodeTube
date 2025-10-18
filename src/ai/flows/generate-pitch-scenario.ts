'use server';

/**
 * @fileOverview Generates an interview scenario based on course content.
 *
 * - generatePitchScenario - A function that generates the scenario.
 * - GeneratePitchScenarioInput - The input type for the function.
 * - GeneratePitchScenarioOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePitchScenarioInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  courseContent: z
    .string()
    .describe('A summary of all chapter titles and their notes.'),
});
export type GeneratePitchScenarioInput = z.infer<
  typeof GeneratePitchScenarioInputSchema
>;

const GeneratePitchScenarioOutputSchema = z.object({
  scenario: z
    .string()
    .describe(
      'A realistic behavioral interview question or scenario related to the course project.'
    ),
});
export type GeneratePitchScenarioOutput = z.infer<
  typeof GeneratePitchScenarioOutputSchema
>;

export async function generatePitchScenario(
  input: GeneratePitchScenarioInput
): Promise<GeneratePitchScenarioOutput> {
  return generatePitchScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePitchScenarioPrompt',
  input: {schema: GeneratePitchScenarioInputSchema},
  output: {schema: GeneratePitchScenarioOutputSchema},
  prompt: `You are a senior hiring manager at a top tech company, preparing to interview a candidate.

  The candidate has submitted a project they built based on a course titled "{{courseTitle}}".
  The project content is summarized as follows:
  {{courseContent}}

  Your task is to create one realistic, open-ended behavioral interview question that prompts the candidate to discuss their project. The question should encourage them to talk about their technical decisions, challenges, or overall architecture.

  Example Question: "I see you completed a project that uses Next.js and Firebase. Can you walk me through the architecture and explain a technical challenge you faced and how you overcame it?"

  Generate a similar question based on the provided course content.
  `,
});

const generatePitchScenarioFlow = ai.defineFlow(
  {
    name: 'generatePitchScenarioFlow',
    inputSchema: GeneratePitchScenarioInputSchema,
    outputSchema: GeneratePitchScenarioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
