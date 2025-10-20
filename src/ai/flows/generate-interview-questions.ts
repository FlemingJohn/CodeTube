
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
  transcript: z
    .string()
    .describe('The transcript of the course chapter.'),
  chapterTitle: z.string().describe('The title of the chapter for context.'),
});
export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const InterviewQuestionSchema = z.object({
    question: z.string().describe('The interview question.'),
    answer: z.string().describe('A detailed, expert-level answer to the question.'),
});


const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(InterviewQuestionSchema).length(3).describe('An array of 3 interview questions with answers based on the chapter content.'),
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
  prompt: `You are a senior technical interviewer and an expert in the topic of: "{{chapterTitle}}".

  Based on the provided transcript for this chapter, your task is to generate 3 challenging and relevant interview questions that a candidate should be able to answer after studying this material.

  For each question, provide a detailed, expert-level answer. The answer should not only be correct but also provide context, best practices, and potential trade-offs, as if you were explaining it to a fellow engineer.

  Chapter Title: {{{chapterTitle}}}
  Chapter Transcript:
  \`\`\`
  {{{transcript}}}
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
    if (!input.transcript) {
      throw new Error('Chapter transcript is required to generate interview questions.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
