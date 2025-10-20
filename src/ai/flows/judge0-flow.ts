
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

    try {
        const submissionResponse = await axios.request({
            method: 'POST',
            url: `https://${apiHost}/submissions`,
            params: {
              base64_encoded: 'false',
              fields: 'token' // Only get token on submission
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
        });

        const { token } = submissionResponse.data;

        if (!token) {
            throw new Error('Failed to get submission token from Judge0.');
        }
        
        let submissionResult;
        
        // Poll for the result
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before polling
            const resultResponse = await axios.request({
                method: 'GET',
                url: `https://${apiHost}/submissions/${token}`,
                params: {
                    base64_encoded: 'false',
                    fields: '*'
                },
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': apiHost
                }
            });
            
            submissionResult = resultResponse.data;

            // Stop polling if the status is not "In Queue" or "Processing"
            if (submissionResult.status.id > 2) {
                break;
            }
        }

        return submissionResult;

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
