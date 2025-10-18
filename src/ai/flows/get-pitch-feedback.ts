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
import wav from 'wav';

const GetPitchFeedbackInputSchema = z.object({
  scenario: z.string().describe('The interview question that was asked.'),
  audioDataUri: z
    .string()
    .describe(
      "The user's recorded audio answer as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  transcribedAnswer: z
    .string()
    .describe("The transcription of the user's audio response."),
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

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const getPitchFeedbackFlow = ai.defineFlow(
  {
    name: 'getPitchFeedbackFlow',
    inputSchema: GetPitchFeedbackInputSchema,
    outputSchema: GetPitchFeedbackOutputSchema,
  },
  async input => {
    const audioBuffer = Buffer.from(
      input.audioDataUri.substring(input.audioDataUri.indexOf(',') + 1),
      'base64'
    );
    const wavAudio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    const transcribed = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: [
        {text: 'Transcribe the following audio.'},
        {media: {url: wavAudio, contentType: 'audio/wav'}},
      ],
    });
    const transcribedAnswer = transcribed.text;

    const feedbackPrompt = ai.definePrompt({
      name: 'feedbackPrompt',
      output: {schema: GetPitchFeedbackOutputSchema},
      prompt: `You are an expert interview coach providing feedback on a candidate's answer.
  
      The interview question was:
      "${input.scenario}"
      
      The candidate's transcribed answer is:
      "${transcribedAnswer}"
      
      Your task is to analyze the answer and provide constructive feedback.
      - Provide an overall summary of their performance.
      - Give a breakdown of specific points, highlighting both strengths and areas for improvement.
      - Focus on clarity, confidence, and use of the STAR method (Situation, Task, Action, Result) if applicable.
      - DO NOT re-generate the transcribedAnswer. It is provided for you.
      `,
    });

    const {output} = await feedbackPrompt({
      ...input,
      transcribedAnswer,
    });

    return {...output!, transcribedAnswer};
  }
);

export async function getPitchFeedback(
  input: GetPitchFeedbackInput
): Promise<GetPitchFeedbackOutput> {
  return getPitchFeedbackFlow(input);
}
