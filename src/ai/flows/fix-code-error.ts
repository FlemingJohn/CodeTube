
'use server';

/**
 * @fileOverview A flow for fixing code errors using AI.
 *
 * - fixCodeError - A function that handles the code fixing process.
 * - FixCodeErrorInput - The input type for the function.
 * - FixCodeErrorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FixCodeErrorInputSchema = z.object({
  code: z.string().describe('The source code that contains an error.'),
  error: z.string().describe('The error message produced by the code.'),
});
export type FixCodeErrorInput = z.infer<typeof FixCodeErrorInputSchema>;

const FixCodeErrorOutputSchema = z.object({
  fixedCode: z.string().describe('The corrected version of the code. Return only the code, without any explanations or markdown formatting.'),
  explanation: z.string().describe('A step-by-step explanation of what the error was and how the fix addresses it. Use Markdown for formatting.'),
});
export type FixCodeErrorOutput = z.infer<typeof FixCodeErrorOutputSchema>;


const prompt = ai.definePrompt({
    name: 'fixCodeErrorPrompt',
    input: { schema: FixCodeErrorInputSchema },
    output: { schema: FixCodeErrorOutputSchema },
    prompt: `You are an expert programmer who can debug and fix code, and clearly explain the solution to a beginner.

    The user has provided a code snippet that produced an error. Your task is to fix the code and explain the fix.
    
    1.  **Analyze the Error**: Understand the root cause of the error message based on the provided code.
    2.  **Fix the Code**: Correct the code to resolve the error.
    3.  **Explain the Fix**: Provide a clear, step-by-step explanation. Describe what the original error was and how your changes solve the problem.
    4.  **Format Output**:
        *   Return the corrected, complete code snippet in the 'fixedCode' field. Do not add any extra comments or markdown to the code itself.
        *   Return the explanation in the 'explanation' field. You can use Markdown for lists or code formatting within the explanation.

    Original Code:
    \`\`\`
    {{{code}}}
    \`\`\`

    Error Message:
    \`\`\`
    {{{error}}}
    \`\`\`
    `,
});

const fixCodeErrorFlow = ai.defineFlow(
  {
    name: 'fixCodeErrorFlow',
    inputSchema: FixCodeErrorInputSchema,
    outputSchema: FixCodeErrorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


export async function fixCodeError(
  input: FixCodeErrorInput
): Promise<FixCodeErrorOutput> {
  return fixCodeErrorFlow(input);
}
