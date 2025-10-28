
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
  courseContent: z
    .string()
    .describe('The full transcript of the course, used as the main source for the quiz.'),
  chapterTitle: z.string().describe('The title of the chapter.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The generated multiple-choice question.'),
  options: z
    .array(z.string())
    .length(4)
    .describe('An array of 4 possible answers.'),
  answer: z.string().describe('The correct answer from the options array.'),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).length(5).describe('An array of 5 quiz questions.'),
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

  Based on the provided course content and chapter title, create a list of 5 multiple-choice questions that are relevant to the specific chapter.
  - Each question should be relevant to the key concepts in the chapter.
  - For each question, provide four plausible answers, one of which must be correct.
  - Ensure the 'answer' field in the output for each question exactly matches the text of the correct option.

  Chapter Title: {{{chapterTitle}}}
  Full Course Content:
  \`\`\`
  {{{courseContent}}}
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
    if (!input.courseContent) {
      throw new Error('Course content is required to generate a quiz.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
