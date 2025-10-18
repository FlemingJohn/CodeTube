'use server';

/**
 * @fileOverview Generates a quiz question for a chapter.
 *
 * - generateQuiz - A function that generates a quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  chapterContent: z
    .string()
    .describe('The content of the chapter, such as a summary or transcript.'),
  chapterTitle: z.string().describe('The title of the chapter.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  question: z.string().describe('The generated multiple-choice question.'),
  options: z
    .array(z.string())
    .length(4)
    .describe('An array of 4 possible answers.'),
  answer: z.string().describe('The correct answer from the options array.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator who creates simple multiple-choice questions to test a user's understanding.

  Based on the provided chapter content and title, create one multiple-choice question with four possible answers.
  - The question should be relevant to the key concepts in the chapter.
  - One of the options must be the correct answer.
  - The other three options should be plausible but incorrect distractors.
  - Ensure the 'answer' field in the output exactly matches the text of the correct option.

  Chapter Title: {{{chapterTitle}}}
  Chapter Content:
  \`\`\`
  {{{chapterContent}}}
  \`\`\`
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    if (!input.chapterContent) {
      throw new Error('Chapter content is required to generate a quiz.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
