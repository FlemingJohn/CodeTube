
'use server';

/**
 * @fileOverview A flow for generating a comprehensive learning plan.
 *
 * - generateLearningPlan - Generates a full plan with concepts, roadmap, and videos.
 * - compareVideos - Compares a list of videos and provides a recommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { suggestVideos } from './suggest-videos-flow';
import { marked } from 'marked';


// Input and Output Schemas
const GenerateLearningPlanInputSchema = z.object({
  topic: z.string().describe('The topic the user wants to learn about.'),
});
export type GenerateLearningPlanInput = z.infer<typeof GenerateLearningPlanInputSchema>;

const KeyConceptSchema = z.object({
  concept: z.string().describe('A key concept, technology, or jargon.'),
  description: z.string().describe('A brief, one-sentence explanation of the concept.'),
});

const VideoSuggestionSchema = z.object({
  videoId: z.string().describe("The YouTube video's ID."),
  title: z.string().describe('The title of the YouTube video.'),
  channelTitle: z.string().describe("The YouTube channel's name."),
  thumbnailUrl: z.string().describe('The URL of the video thumbnail.'),
});
export type VideoSuggestion = z.infer<typeof VideoSuggestionSchema>;


const RoadmapStepSchema = z.object({
  step: z.number().describe('The step number in the roadmap.'),
  title: z.string().describe('A concise title for this learning step.'),
  description: z.string().describe('A one-sentence description of what to learn in this step.'),
  suggestedVideos: z.array(VideoSuggestionSchema).describe('A list of suggested videos for this step.'),
});

const PrerequisiteSchema = z.object({
    topic: z.string().describe('The prerequisite topic.'),
    suggestedVideos: z.array(VideoSuggestionSchema).describe('A list of suggested videos for this prerequisite.'),
});


const LearningPlanSchema = z.object({
  prerequisites: z.array(PrerequisiteSchema).describe('A list of prerequisite topics the user should know, with video suggestions.'),
  keyConcepts: z.array(KeyConceptSchema).describe('A list of key concepts related to the topic.'),
  roadmap: z.array(RoadmapStepSchema).describe('A step-by-step learning roadmap.'),
});
export type LearningPlan = z.infer<typeof LearningPlanSchema>;


const LearningPlanGenerationPromptSchema = z.object({
    prerequisites: z.array(z.string()).describe('A list of 2-4 prerequisite topics the user should know.'),
    keyConcepts: z.array(KeyConceptSchema).min(3).max(5).describe('A list of 3-5 key concepts related to the topic.'),
    roadmap: z.array(z.object({
        step: z.number(),
        title: z.string(),
        description: z.string(),
    })).min(3).max(5).describe('A step-by-step learning roadmap with 3-5 steps.'),
});


// Main Flow: generateLearningPlan
const generateLearningPlanFlow = ai.defineFlow(
  {
    name: 'generateLearningPlanFlow',
    inputSchema: GenerateLearningPlanInputSchema,
    outputSchema: LearningPlanSchema,
  },
  async ({ topic }) => {
    // Step 1: Generate the structural plan (prerequisites, concepts, roadmap)
    const planningPrompt = ai.definePrompt({
        name: 'learningPlanStructurePrompt',
        output: { schema: LearningPlanGenerationPromptSchema },
        prompt: `You are an expert curriculum developer. For the topic "${topic}", create a structured learning plan.
        - Identify 2-4 essential prerequisite topics.
        - List 3-5 key concepts or technologies a learner will encounter.
        - Outline a 3-5 step, logically sequenced roadmap from basics to more advanced aspects.`
    });

    const { output: planStructure } = await planningPrompt();
    if (!planStructure) {
        throw new Error("Failed to generate the initial learning plan structure.");
    }

    // Step 2: For each roadmap step, find relevant videos
    const roadmapWithVideos = await Promise.all(
        planStructure.roadmap.map(async (step) => {
            const videoSuggestions = await suggestVideos({ query: `${topic} - ${step.title}` });
            return {
                ...step,
                suggestedVideos: videoSuggestions.videos,
            };
        })
    );

    // Step 3: For each prerequisite, find relevant videos
    const prerequisitesWithVideos = await Promise.all(
        planStructure.prerequisites.map(async (prereqTopic) => {
            const videoSuggestions = await suggestVideos({ query: `${prereqTopic} tutorial for beginners` });
            return {
                topic: prereqTopic,
                suggestedVideos: videoSuggestions.videos.slice(0, 3), // Take top 3
            };
        })
    );

    return {
        prerequisites: prerequisitesWithVideos,
        keyConcepts: planStructure.keyConcepts,
        roadmap: roadmapWithVideos,
    };
  }
);


export async function generateLearningPlan(
  input: GenerateLearningPlanInput
): Promise<LearningPlan> {
  return generateLearningPlanFlow(input);
}


// Secondary Flow: compareVideos
const CompareVideosInputSchema = z.object({
    topic: z.string(),
    videos: z.array(z.object({
        id: z.string(),
        title: z.string(),
        channelTitle: z.string(),
    })),
});
export type CompareVideosInput = z.infer<typeof CompareVideosInputSchema>;

const CompareVideosOutputSchema = z.object({
    comparison: z.string().describe("A comparison of the videos in Markdown format, ending with a clear recommendation."),
});
export type CompareVideosOutput = z.infer<typeof CompareVideosOutputSchema>;


const compareVideosFlow = ai.defineFlow(
    {
        name: 'compareVideosFlow',
        inputSchema: CompareVideosInputSchema,
        outputSchema: CompareVideosOutputSchema
    },
    async ({ topic, videos }) => {
        const videoList = videos.map(v => `- **${v.title}** by *${v.channelTitle}*`).join('\n');

        const comparisonPrompt = ai.definePrompt({
            name: 'videoComparisonPrompt',
            output: { schema: CompareVideosOutputSchema },
            prompt: `You are an expert tech educator. A student learning about "${topic}" needs help choosing between the following videos:
            
${videoList}

Analyze the video titles and channel names to provide a comparison. Consider:
- Which video seems best for a complete beginner?
- Which one seems more project-oriented or hands-on?
- Which might be a quick-and-to-the-point overview?

Structure your response in Markdown with a final recommendation. For example:
### Comparison
- **Video A** seems like a comprehensive, deep-dive tutorial.
- **Video B** from a well-known conference speaker, is likely a high-level overview.

### Recommendation
For a beginner, start with **Video A**. If you're short on time, watch **Video B**.`,
        });

        const { output } = await comparisonPrompt();
        if (!output) {
            throw new Error("Failed to generate video comparison.");
        }
        
        // Parse markdown to HTML
        const htmlComparison = await marked.parse(output.comparison);
        
        return { comparison: htmlComparison };
    }
);

export async function compareVideos(
    input: CompareVideosInput
): Promise<CompareVideosOutput> {
  return compareVideosFlow(input);
}
