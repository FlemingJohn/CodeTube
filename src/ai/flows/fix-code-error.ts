
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
});
export type FixCodeErrorOutput = z.infer<typeof FixCodeErrorOutputSchema>;


const prompt = ai.definePrompt({
    name: 'fixCodeErrorPrompt',
    input: { schema: FixCodeErrorInputSchema },
    output: { schema: FixCodeErrorOutputSchema },
    prompt: `You are an expert programmer who can debug and fix code.

    The user has provided a code snippet that produced an error. Your task is to fix the code.
    
    - Analyze the provided code and the error message.
    - Return only the corrected, complete code snippet.
    - Do not provide any explanations, comments, or markdown formatting like \`\`\`. Just return the raw, fixed code.

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
