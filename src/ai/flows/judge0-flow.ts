
'use server';

/**
 * @fileOverview A flow for executing code using the Judge0 API.
 *
 * - runCode - A function that handles the code execution process.
 * - RunCodeInput - The input type for the runCode function.
 * - RunCodeOutput - The return type for the runCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

const RunCodeInputSchema = z.object({
  source_code: z.string().describe('The code to execute.'),
  language_id: z.number().describe('The language ID for execution.'),
});
export type RunCodeInput = z.infer<typeof RunCodeInputSchema>;

const RunCodeOutputSchema = z.object({
  stdout: z.string().nullable(),
  stderr: z.string().nullable(),
  compile_output: z.string().nullable(),
  message: z.string().nullable(),
  status: z.object({
    id: z.number(),
    description: z.string(),
  }),
});
export type RunCodeOutput = z.infer<typeof RunCodeOutputSchema>;


const runCodeFlow = ai.defineFlow(
  {
    name: 'runCodeFlow',
    inputSchema: RunCodeInputSchema,
    outputSchema: RunCodeOutputSchema,
  },
  async ({ source_code, language_id }) => {
    const apiKey = process.env.JUDGE0_API_KEY;
    const apiHost = 'judge0-ce.p.rapidapi.com';

    if (!apiKey) {
        throw new Error('Judge0 API key is not configured.');
    }

    const options = {
        method: 'POST',
        url: `https://${apiHost}/submissions`,
        params: {
          base64_encoded: 'false',
          fields: '*'
        },
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        },
        data: {
          language_id,
          source_code,
        }
      };

    try {
        const response = await axios.request(options);
        let submission = response.data;
        
        // Poll for result
        while (submission.status.id <= 2) { // 1: In Queue, 2: Processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            const resultResponse = await axios.request({
                method: 'GET',
                url: `https://${apiHost}/submissions/${submission.token}?base64_encoded=false&fields=*`,
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': apiHost
                }
            });
            submission = resultResponse.data;
        }

        return submission;

    } catch (error: any) {
        console.error("Judge0 API Error:", error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.error || 'Failed to execute code via Judge0.');
    }
  }
);


export async function runCode(
  input: RunCodeInput
): Promise<RunCodeOutput> {
  return runCodeFlow(input);
}
