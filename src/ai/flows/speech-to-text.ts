
'use server';
/**
 * @fileOverview A flow for converting speech to text using AI.
 *
 * - speechToText - A function that handles the speech-to-text process.
 * - SpeechToTextInput - The input type for the function.
 * - SpeechToTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z.string().describe("A chunk of audio as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: [{ media: { url: input.audioDataUri } }],
    });

    return { text: llmResponse.text };
  }
);

export async function speechToText(
  input: SpeechToTextInput
): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

