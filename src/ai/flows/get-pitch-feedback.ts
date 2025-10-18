
'use server';
/**
 * @fileOverview Analyzes a user's answer to an interview question and provides feedback.
 *
 * - getPitchFeedback - A function that generates the feedback.
 * - GetPitchFeedbackInput - The input type for the function.
 * - GetPitchFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPitchFeedbackInputSchema = z.object({
  scenario: z.string().describe('The interview question that was asked.'),
  userAnswer: z
    .string()
    .describe("The user's typed answer to the scenario."),
});
export type GetPitchFeedbackInput = z.infer<typeof GetPitchFeedbackInputSchema>;

const FeedbackItemSchema = z.object({
  isPositive: z
    .boolean()
    .describe(
      'Whether this piece of feedback is positive or an area for improvement.'
    ),
  feedback: z.string().describe('The specific feedback point.'),
});

const GetPitchFeedbackOutputSchema = z.object({
  overallFeedback: z
    .string()
    .describe("A summary of the user's performance."),
  feedbackBreakdown: z
    .array(FeedbackItemSchema)
    .describe(
      'A list of specific feedback points, both positive and areas for improvement.'
    ),
});
export type GetPitchFeedbackOutput = z.infer<
  typeof GetPitchFeedbackOutputSchema
>;

const getPitchFeedbackFlow = ai.defineFlow(
  {
    name: 'getPitchFeedbackFlow',
    inputSchema: GetPitchFeedbackInputSchema,
    outputSchema: GetPitchFeedbackOutputSchema,
  },
  async ({ scenario, userAnswer }) => {

    const feedbackPrompt = ai.definePrompt({
      name: 'feedbackPrompt',
      output: {schema: GetPitchFeedbackOutputSchema},
      prompt: `You are an expert interview coach providing feedback on a candidate's answer.
  
      The interview question was:
      "${scenario}"
      
      The candidate's answer is:
      "${userAnswer}"
      
      Your task is to analyze the answer and provide constructive feedback.
      - Provide an overall summary of their performance.
      - Give a breakdown of specific points, highlighting both strengths and areas for improvement.
      - Focus on clarity, conciseness, and the use of the STAR method (Situation, Task, Action, Result) if applicable.
      - Be encouraging but also direct with your feedback.
      `,
    });

    const {output} = await feedbackPrompt();

    return output!;
  }
);

export async function getPitchFeedback(
  input: GetPitchFeedbackInput
): Promise<GetPitchFeedbackOutput> {
  return getPitchFeedbackFlow(input);
}
