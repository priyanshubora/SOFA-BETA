'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting port operation events from Statements of Fact (SoFs).
 *
 * - extractPortOperationEvents - A function that takes the content of an SoF and returns structured data.
 * - ExtractPortOperationEventsInput - The input type for the extractPortOperationEvents function.
 * - ExtractPortOperationEventsOutput - The return type for the extractPortOperationEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExtractPortOperationEventsInputSchema = z.object({
  sofContent: z.string().describe("The text content of the Statement of Fact file."),
});
export type ExtractPortOperationEventsInput = z.infer<typeof ExtractPortOperationEventsInputSchema>;

const ExtractPortOperationEventsOutputSchema = z.object({
  vesselName: z.string().describe("The name of the vessel (or ship) mentioned in the SoF. Look for 'Vessel Name' or 'Ship Name'."),
  portOfCall: z.string().optional().describe("The port where the operations are taking place."),
  berth: z.string().optional().describe("The specific berth or anchorage location."),
  cargoDescription: z.string().optional().describe("Description of the cargo being loaded or discharged."),
  cargoQuantity: z.string().optional().describe("The quantity of the cargo (e.g., in metric tons)."),
  voyageNumber: z.string().optional().describe("The voyage number of the vessel."),
  noticeOfReadinessTendered: z.string().optional().describe("The date and time when the Notice of Readiness (NOR) was tendered."),
  extractionConfidence: z.number().optional().describe("A score from 0 to 100 representing the AI's confidence in the accuracy of the extracted data. Base this on how well the document structure matches a typical Statement of Fact and how many fields had to be inferred or were left blank."),
  events: z.array(
    z.object({
      event: z.string().describe('The exact, verbatim text for the port operation event from the remarks column (e.g., "Pilot Attended On Board in the vessel"). Do not summarize or change it.'),
      category: z.string().describe("The general category of the event (e.g., 'Arrival', 'Cargo Operations', 'Departure', 'Delays', 'Stoppages', 'Bunkering', 'Anchorage', or 'Other')."),
      startTime: z.string().describe('The start time of the event in YYYY-MM-DD HH:MM format  .'),
      endTime: z.string().describe('The end time of the event in YYYY-MM-DD HH:MM format .'),
      duration: z.string().describe("Duration of the event. If not calculable, leave empty or 'Not Mentioned."),
      status: z.string().describe("The status of the event (e.g., 'Completed', 'In Progress', 'Delayed')."),
      remark: z.string().optional().describe('Any additional notes, comments or details about the event from the SoF.')
    })
  ).describe('An array of port operation events with their start and end times, sorted chronologically.'),
});
export type ExtractPortOperationEventsOutput = z.infer<typeof ExtractPortOperationEventsOutputSchema>;
export type TimelineBlock = any; // This will be handled by the frontend now.
export type LaytimeCalculation = any; // This will be handled by the frontend now.


export async function extractPortOperationEvents(input: ExtractPortOperationEventsInput): Promise<ExtractPortOperationEventsOutput> {
  return extractPortOperationEventsFlow(input);
}

const extractPortOperationEventsPrompt = ai.definePrompt({
  name: 'extractPortOperationEventsPrompt',
  input: {schema: ExtractPortOperationEventsInputSchema},
  output: {schema: ExtractPortOperationEventsOutputSchema},
  prompt: `You are an expert maritime logistics AI. Your task is to analyze the provided Statement of Fact (SoF) and extract all events with the highest level of accuracy.

**Primary Directive: Extract EVERY event. Do not miss ANY event. Every single line item in the SoF that has a date or remark must be treated as a unique, extractable event.**

Here are your tasks:

1.  **Extract All Details (Comprehensive Extraction)**:
    -   Go through the document line-by-line, including the top summary section and the detailed daily log. Nothing should be missed.
    -   Identify **every single event**, no matter how minor. If it has a date or time, it is an event.
    -   For **each event**, you must extract:
        -   **event**: Use the **exact, verbatim text** from the "Remarks" column or description.
        -   **category**: Classify each event into one of these specific categories: 'Arrival', 'Cargo Operations', 'Departure', 'Delays', 'Stoppages', 'Bunkering', 'Anchorage', or 'Other'.
        -   **startTime**: The start time of the event in \`YYYY-MM-DD HH:MM\` format.
        -   **endTime**: The end time of the event in \`YYYY-MM-DD HH:MM\` format.
        -   **duration**: The calculated duration between start and end times (e.g., "2h 30m"). If start and end are the same, duration is "0m".
        -   **status**: The status of the event (e.g., 'Completed', 'In Progress', 'Delayed'). Most events will be 'Completed'.
        -   **remark**: Capture any additional text or notes.
    -   Also extract the following master details:
        -   Vessel/Ship Name/vesselName
        -   Port of Call & Berth/Anchorage
        -   Voyage Number
        -   Cargo Description and Quantity
        -   Date/Time Notice of Readiness (NOR) was tendered
    -   **Crucially, ensure the final list of events is sorted chronologically by \`startTime\`**.

2.  **Handle Missing Timestamps (CRITICAL LOGIC)**:
    -   If an event has a **startTime** but the **endTime** is missing or not specified, you **MUST** use the **startTime** of the very next event in the sequence as the **endTime**.
    -   If an event is the **VERY LAST** one in the document and is missing an **endTime**, you **MUST** set its **endTime** to be the same as its **startTime**.
    -   If an event is missing a **startTime**, try to infer it from the previous event's **endTime**. If you cannot, it's okay to omit the event, but this should be rare.

3.  **Assess Confidence**:
    -   Provide an \`extractionConfidence\` score from 0 to 100.
    -   A score of 95-100 means the document was perfectly structured.
    -   A score below 85 means the document had significant formatting issues.

**Process the following SoF content meticulously and return the complete, detailed analysis in the required JSON format.**

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
    
    if (output && output.events) {
        // Final safeguard: Filter out any events that are fundamentally broken (e.g. missing critical fields)
        output.events = output.events.filter(event => event.event && event.startTime && event.endTime && event.status && event.duration);
    }
    
    return output as ExtractPortOperationEventsOutput;
  }
);
