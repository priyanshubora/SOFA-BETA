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
import {z} from 'zod';

const ExtractPortOperationEventsInputSchema = z.object({
  sofContent: z.string().describe("The text content of the Statement of Fact file."),
});
export type ExtractPortOperationEventsInput = z.infer<typeof ExtractPortOperationEventsInputSchema>;

const LaytimeCalculationSchema = z.object({
  totalLaytime: z.string().describe('The total calculated laytime in a human-readable format (e.g., "2 days, 4 hours, 30 minutes").'),
  allowedLaytime: z.string().describe('The standard allowed laytime based on contract (default or specified).'),
  timeSaved: z.string().describe('Time saved if operations finished before allowed laytime expired.'),
  demurrage: z.string().describe('Extra time taken beyond the allowed laytime.'),
  demurrageCost: z.string().optional().describe('The calculated cost of demurrage based on the extra time taken and a standard daily rate (e.g., "$20,000").'),
  laytimeEvents: z.array(z.object({
    event: z.string(),
    startTime: z.string().describe('The start time of the event in YYYY-MM-DD HH:MM format.'),
    endTime: z.string().describe('The end time of the event in YYYY-MM-DD HH:MM format.'),
    duration: z.string(),
    isCounted: z.boolean().optional().describe('Whether this event duration counts towards the total laytime.'),
    reason: z.string().optional().describe('Reason why the event is or is not counted towards laytime.'),
  })).describe('A breakdown of each event and whether it contributed to the laytime.'),
});
export type LaytimeCalculation = z.infer<typeof LaytimeCalculationSchema>;

const SubEventSchema = z.object({
    event: z.string(),
    category: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    duration: z.string(),
    status: z.string(),
    remark: z.string().optional(),
});

const TimelineBlockSchema = z.object({
    name: z.string(),
    category: z.string(),
    time: z.tuple([z.number(), z.number()]),
    duration: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    subEvents: z.array(SubEventSchema),
}).describe("A block of merged, overlapping events for timeline visualization.");
export type TimelineBlock = z.infer<typeof TimelineBlockSchema>;

const ExtractPortOperationEventsOutputSchema = z.object({
  vesselName: z.string().describe("The name of the vessel (or ship) mentioned in the SoF. Look for 'Vessel Name' or 'Ship Name'."),
  portOfCall: z.string().optional().describe("The port where the operations are taking place."),
  berth: z.string().optional().describe("The specific berth or anchorage location."),
  cargoDescription: z.string().optional().describe("Description of the cargo being loaded or discharged."),
  cargoQuantity: z.string().optional().describe("The quantity of the cargo (e.g., in metric tons)."),
  voyageNumber: z.string().optional().describe("The voyage number of the vessel."),
  noticeOfReadinessTendered: z.string().optional().describe("The date and time when the Notice of Readiness (NOR) was tendered."),
  events: z.array(
    z.object({
      event: z.string().describe('The exact, verbatim text for the port operation event from the remarks column (e.g., "Pilot Attended On Board in the vessel"). Do not summarize or change it.'),
      category: z.string().describe("The general category of the event (e.g., 'Arrival', 'Cargo Operations', 'Departure', 'Delays', 'Stoppages', 'Bunkering', 'Anchorage', or 'Other')."),
      startTime: z.string().describe('The start time of the event in YYYY-MM-DD HH:MM format.'),
      endTime: z.string().describe('The end time of the event in YYYY-MM-DD HH:MM format.'),
      duration: z.string().describe('The calculated duration of the event (e.g., "2h 30m").'),
      status: z.string().describe("The status of the event (e.g., 'Completed', 'In Progress', 'Delayed')."),
      remark: z.string().optional().describe('Any additional notes, comments or details about the event from the SoF.')
    })
  ).describe('An array of port operation events with their start and end times, sorted chronologically.'),
  timelineBlocks: z.array(TimelineBlockSchema).optional().describe("An array of merged, overlapping event blocks for timeline visualization."),
  laytimeCalculation: LaytimeCalculationSchema.optional().describe('The detailed laytime calculation results.'),
  eventsSummary: z.string().optional().describe('A concise, bulleted summary of the key insights from the port events.'),
});
export type ExtractPortOperationEventsOutput = z.infer<typeof ExtractPortOperationEventsOutputSchema>;

export async function extractPortOperationEvents(input: ExtractPortOperationEventsInput): Promise<ExtractPortOperationEventsOutput> {
  return extractPortOperationEventsFlow(input);
}

const extractPortOperationEventsPrompt = ai.definePrompt({
  name: 'extractPortOperationEventsPrompt',
  input: {schema: ExtractPortOperationEventsInputSchema},
  output: {schema: ExtractPortOperationEventsOutputSchema.omit({ timelineBlocks: true })},
  prompt: `You are an expert maritime logistics AI with exceptional attention to detail. Your task is to analyze the provided Statement of Fact (SoF) and perform three tasks with the highest level of accuracy and completeness.

**Primary Directive: Do not miss ANY event. Every single line item in the SoF that has a timestamp must be treated as a unique, extractable event.**

Here are your tasks:

1.  **Extract All Details (Comprehensive Extraction)**:
    -   Go through the document line-by-line. Identify **every single event**, no matter how minor. If it has a date or time, it is an event. This includes short breaks, meetings, weather changes, etc.
    -   For **each event**, you must extract:
        -   **event**: Use the **exact, verbatim text** from the "Remarks" column of the SoF. Do NOT summarize or rephrase.
        -   **category**: Classify each event into one of these specific categories: 'Arrival', 'Cargo Operations', 'Departure', 'Delays', 'Stoppages', 'Bunkering', 'Anchorage', or 'Other'.
        -   **startTime**: The start time of the event in \`YYYY-MM-DD HH:MM\` format. Pay close attention to the date column.
        -   **endTime**: The end time of the event in \`YYYY-MM-DD HH:MM\` format.
        -   **duration**: The calculated duration between start and end times (e.g., "2h 30m"). If start and end are the same, duration is "0m".
        -   **status**: The status of the event (e.g., 'Completed', 'In Progress', 'Delayed'). Most events will be 'Completed'.
        -   **remark**: Capture any additional text or notes from the "Remarks" column for that specific event.
    -   Also extract the following master details from anywhere in the document: Vessel Name, Port of Call, Voyage Number, etc.
    -   **Crucially, ensure the final list of events is sorted chronologically by 'startTime'**.

2.  **CRITICAL RULE FOR END TIMES**:
    -   Events in the SoF are always listed in chronological order.
    -   If an event has a 'startTime' but no explicit 'endTime' is mentioned for it, you **MUST** infer the 'endTime'.
    -   The 'endTime' for an event is the 'startTime' of the very next event in the sequence.
    -   If an event is the very last one, or if it represents a single point in time (like 'NOR Tendered'), its 'endTime' should be the same as its 'startTime'.
    -   You must apply this logic to ensure every single event has a valid 'endTime', which is necessary to calculate the 'duration'.

3.  **Calculate Laytime (Detailed Breakdown)**:
    -   Perform a detailed laytime calculation. Assume a standard allowed laytime of "3 days" unless specified otherwise.
    -   Analyze each event you extracted. For the \`laytimeEvents\` array, list every event and determine if its duration should be counted towards laytime.
    -   Provide a clear \`reason\` for why each event is counted or not counted (e.g., "Cargo operations count towards laytime," "Rain delay - time does not count," "Holiday - time does not count").
    -   Calculate \`totalLaytime\`, \`timeSaved\` (despatch), and \`demurrage\`.
    -   If demurrage occurs, calculate the \`demurrageCost\` assuming a standard rate of $20,000 per day, prorated for the exact demurrage duration. Format the result as a currency string (e.g., '$15,500.00').

4.  **Summarize Key Insights**:
    -   Provide a brief, bullet-point summary highlighting the most critical insights, such as:
        -   Total time spent in port.
        -   Total time spent on cargo operations.
        -   Total time lost to major delays or stoppages, specifying the reasons (e.g., weather, equipment failure).

**Process the following SoF content meticulously and return the complete, detailed analysis in the required JSON format. If you cannot reliably calculate laytime or the summary, you may omit those fields, but you MUST return the vesselName and the full list of events.**

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

    if (output?.laytimeCalculation?.laytimeEvents) {
      output.laytimeCalculation.laytimeEvents = output.laytimeCalculation.laytimeEvents.filter(
        event => event.isCounted !== undefined && event.isCounted !== null
      );
    }
    
    // The AI is not responsible for creating timeline blocks, so we can return the output as is.
    // The frontend will handle the creation of timeline blocks.
    return output as ExtractPortOperationEventsOutput;
  }
);
