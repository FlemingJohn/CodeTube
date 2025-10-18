'use server';

/**
 * @fileOverview Generates interview questions based on course content.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the function.
 * - GenerateInterviewQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  transcripts: z
    .string()
    .describe('The combined transcripts of all course chapters.'),
  courseTitle: z.string().describe('The title of the course for context.'),
});
export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const InterviewQuestionSchema = z.object({
    question: z.string().describe('The interview question.'),
    answer: z.string().describe('A detailed, expert-level answer to the question.'),
});


const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(InterviewQuestionSchema).length(5).describe('An array of 5 interview questions with answers.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are a senior technical interviewer and an expert in the field of: "{{courseTitle}}".

  Based on the provided transcripts from a course, your task is to generate 5 challenging and relevant interview questions that a candidate should be able to answer after completing this course.

  For each question, provide a detailed, expert-level answer. The answer should not only be correct but also provide context, best practices, and potential trade-offs, as if you were explaining it to a fellow engineer.

  Course Title: {{{courseTitle}}}
  Course Transcripts:
  \`\`\`
  {{{transcripts}}}
  \`\`\`
  `,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    if (!input.transcripts) {
      throw new Error('Course transcripts are required to generate interview questions.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
