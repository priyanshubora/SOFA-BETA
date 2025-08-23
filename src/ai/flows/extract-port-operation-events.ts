'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting port operation events from Statements of Fact (SoFs).
 * It also calculates laytime and summarizes the events in a single operation.
 *
 * - extractPortOperationEvents - A function that takes the content of an SoF and returns structured data, laytime calculations, and a summary.
 * - ExtractPortOperationEventsInput - The input type for the extractPortOperationEvents function.
 * - ExtractPortOperationEventsOutput - The return type for the extractPortOperationEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPortOperationEventsInputSchema = z.object({
  sofContent: z.string().describe("The text content of the Statement of Fact file."),
});
export type ExtractPortOperationEventsInput = z.infer<typeof ExtractPortOperationEventsInputSchema>;

const LaytimeCalculationSchema = z.object({
  totalLaytime: z.string().describe('The total calculated laytime in a human-readable format (e.g., "2 days, 4 hours, 30 minutes").'),
  allowedLaytime: z.string().describe('The standard allowed laytime based on contract (default or specified).'),
  timeSaved: z.string().describe('Time saved if operations finished before allowed laytime expired.'),
  demurrage: z.string().describe('Extra time taken beyond the allowed laytime.'),
  laytimeEvents: z.array(z.object({
    event: z.string(),
    duration: z.string(),
    isCounted: z.boolean().describe('Whether this event duration counts towards the total laytime.'),
    reason: z.string().optional().describe('Reason why the event is or is not counted towards laytime.'),
  })).describe('A breakdown of each event and whether it contributed to the laytime.'),
});
export type LaytimeCalculation = z.infer<typeof LaytimeCalculationSchema>;

const ExtractPortOperationEventsOutputSchema = z.object({
  vesselName: z.string().describe("The name of the vessel (or ship) mentioned in the SoF."),
  events: z.array(
    z.object({
      event: z.string().describe('A concise title for the port operation event (e.g., "Pilot Onboard", "Cargo Discharging").'),
      category: z.string().describe("The general category of the event (e.g., 'Arrival', 'Cargo Operations', 'Departure', 'Delays')."),
      startTime: z.string().describe('The start time of the event in YYYY-MM-DD HH:MM format.'),
      endTime: z.string().describe('The end time of the event in YYYY-MM-DD HH:MM format.'),
      duration: z.string().describe('The calculated duration of the event (e.g., "2h 30m").'),
      status: z.string().describe("The status of the event (e.g., 'Completed', 'In Progress', 'Delayed')."),
      remark: z.string().optional().describe('Any additional notes, comments or details about the event from the SoF.')
    })
  ).describe('An array of port operation events with their start and end times.'),
  laytimeCalculation: LaytimeCalculationSchema.describe('The detailed laytime calculation results.'),
  eventsSummary: z.string().describe('A concise, bulleted summary of the key insights from the port events.'),
});
export type ExtractPortOperationEventsOutput = z.infer<typeof ExtractPortOperationEventsOutputSchema>;

export async function extractPortOperationEvents(input: ExtractPortOperationEventsInput): Promise<ExtractPortOperationEventsOutput> {
  return extractPortOperationEventsFlow(input);
}

const extractPortOperationEventsPrompt = ai.definePrompt({
  name: 'extractPortOperationEventsPrompt',
  input: {schema: ExtractPortOperationEventsInputSchema},
  output: {schema: ExtractPortOperationEventsOutputSchema},
  prompt: `You are an expert maritime logistics AI. Analyze the provided Statement of Fact (SoF) and perform the following three tasks in a single response:

1.  **Extract Events**: Identify the vessel name (it may be labeled as 'vessel', 'ship', or another similar term) and all significant port operation events. For each event, extract the event title, category, start and end times (YYYY-MM-DD HH:MM), duration, status, and any remarks.
2.  **Calculate Laytime**: Perform a laytime calculation. Assume a standard allowed laytime of "3 days". Calculate the total laytime used, time saved (despatch), and extra time (demurrage). Detail which events count towards laytime and why.
3.  **Summarize Insights**: Provide a brief, bullet-point summary highlighting total port time, cargo operation duration, and major delays.

Process the following SoF content and return the full analysis in the required JSON format.

SoF Content:
{{{sofContent}}}`,
});

const extractPortOperationEventsFlow = ai.defineFlow(
  {
    name: 'extractPortOperationEventsFlow',
    inputSchema: ExtractPortOperationEventsInputSchema,
    outputSchema: ExtractPortOperationEventsOutputSchema,
  },
  async input => {
    const {output} = await extractPortOperationEventsPrompt(input);
    return output!;
  }
);
