
'use server';

/**
 * @fileOverview AI assistant to guide new users on how to use the platform.
 *
 * - guideNewUsers - A function that provides guidance to new users.
 * - GuideNewUsersInput - The input type for the guideNewusers function.
 * - GuideNewUsersOutput - The return type for the guideNewUsers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuideNewUsersInputSchema = z.object({
  query: z
    .string()
    .describe('The question or request from the new user.'),
});
export type GuideNewUsersInput = z.infer<typeof GuideNewUsersInputSchema>;

const GuideNewUsersOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
});
export type GuideNewUsersOutput = z.infer<typeof GuideNewUsersOutputSchema>;

export async function guideNewUsers(input: GuideNewUsersInput): Promise<GuideNewUsersOutput> {
  return guideNewUsersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'guideNewUsersPrompt',
  input: {schema: GuideNewUsersInputSchema},
  output: {schema: GuideNewUsersOutputSchema},
  prompt: `You are a helpful AI assistant designed to guide new users on how to use the SOFA platform.

  The platform allows users to upload Statements of Fact (SoFs), extract port operation events, calculate laytime, and visualize data.
  The UI consists of a Dashboard with a left panel for uploading and displaying extracted data and a right panel for the AI assistant.
  Here are some example usages:
  - "How do I upload a SoF?"
  - "Where can I see the analytics insights?"
  - "Explain how to compare multiple SoFs."

  Respond to the following user query:
  {{query}}
  `,
});

const guideNewUsersFlow = ai.defineFlow(
  {
    name: 'guideNewusersFlow',
    inputSchema: GuideNewUsersInputSchema,
    outputSchema: GuideNewUsersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
