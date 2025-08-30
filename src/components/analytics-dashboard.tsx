
"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, ResponsiveContainer } from "recharts"
import { parseISO, differenceInHours, format, max, min } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"
import type { ExtractPortOperationEventsOutput } from "@/ai/flows/extract-port-operation-events";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, BarChart as BarChartIcon } from "lucide-react";
import type { Event as ExtractedEvent } from "@/ai/flows/extract-port-operation-events";

interface AnalyticsDashboardProps {
  extractedData: ExtractPortOperationEventsOutput;
}

const CATEGORY_COLORS: { [key: string]: string } = {
    'Arrival': 'hsl(var(--chart-1))',
    'Cargo Operations': 'hsl(var(--chart-2))',
    'Delays': 'hsl(var(--chart-3))',
    'Departure': 'hsl(var(--chart-4))',
    'Stoppages': 'hsl(var(--chart-3))',
    'Other': 'hsl(var(--chart-5))',
    'Default': 'hsl(var(--chart-5))',
};

// This type will hold our merged event blocks for the chart
type MergedEventBlock = {
    name: string;
    category: string;
    time: [number, number]; // [startHour, endHour]
    duration: string;
    startTime: string;
    endTime: string;
    fill: string;
    subEvents: ExtractedEvent[];
};


export function AnalyticsDashboard({ extractedData }: AnalyticsDashboardProps) {
  const chartData = React.useMemo(() => {
    if (!extractedData?.events || extractedData.events.length === 0) {
      return [];
    }
    
    // 1. Sort events by start time, which is crucial for merging
    const sortedEvents = [...extractedData.events].sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    const firstEventTime = parseISO(sortedEvents[0].startTime);

    // 2. Merge overlapping or adjacent events into blocks
    const mergedBlocks: MergedEventBlock[] = [];
    if (sortedEvents.length > 0) {
      let currentBlock: MergedEventBlock | null = null;

      for (const event of sortedEvents) {
        const eventStart = parseISO(event.startTime);
        const eventEnd = parseISO(event.endTime);

        if (currentBlock === null) {
          // Start the first block
          currentBlock = {
            name: 'Timeline Block 1', // We can generate a better name if needed
            category: 'Timeline',
            subEvents: [event],
            startTime: format(eventStart, 'MMM d, HH:mm'),
            endTime: format(eventEnd, 'HH:mm'),
            time: [differenceInHours(eventStart, firstEventTime), differenceInHours(eventEnd, firstEventTime)],
            duration: event.duration, // This will be updated
            fill: CATEGORY_COLORS['Default'], // We'll set this at the end
          };
        } else {
          const blockEndDate = parseISO(currentBlock.subEvents[currentBlock.subEvents.length - 1].endTime);
          
          // Check for overlap: event starts before or at the same time the last event in the block ends
          if (eventStart.getTime() <= blockEndDate.getTime()) {
            // Merge it: add to sub-events and extend the block's end time if necessary
            currentBlock.subEvents.push(event);
            const blockStartDate = parseISO(currentBlock.subEvents[0].startTime);
            
            const newEndDate = max([blockEndDate, eventEnd]);
            currentBlock.endTime = format(newEndDate, 'HH:mm');
            currentBlock.time = [differenceInHours(blockStartDate, firstEventTime), differenceInHours(newEndDate, firstEventTime)];
          } else {
            // No overlap, finalize the current block and start a new one
            mergedBlocks.push(currentBlock);
            currentBlock = {
              name: `Timeline Block ${mergedBlocks.length + 1}`,
              category: 'Timeline',
              subEvents: [event],
              startTime: format(eventStart, 'MMM d, HH:mm'),
              endTime: format(eventEnd, 'HH:mm'),
              time: [differenceInHours(eventStart, firstEventTime), differenceInHours(eventEnd, firstEventTime)],
              duration: event.duration,
              fill: CATEGORY_COLORS['Default'],
            };
          }
        }
      }
      // Add the last block
      if (currentBlock) {
        mergedBlocks.push(currentBlock);
      }
    }
    
    // 3. Post-process blocks to determine name, color, and final duration
    return mergedBlocks.map(block => {
        // Use the category of the longest event in the block as the primary category/color
        const longestEvent = block.subEvents.reduce((longest, current) => {
            const longestDuration = differenceInHours(parseISO(longest.endTime), parseISO(longest.startTime));
            const currentDuration = differenceInHours(parseISO(current.endTime), parseISO(current.startTime));
            return currentDuration > longestDuration ? current : longest;
        });

        const start = parseISO(block.subEvents[0].startTime);
        const end = max(block.subEvents.map(e => parseISO(e.endTime)));
        const totalDurationHours = differenceInHours(end, start);
        const days = Math.floor(totalDurationHours / 24);
        const hours = Math.floor(totalDurationHours % 24);
        const minutes = Math.round((totalDurationHours - Math.floor(totalDurationHours)) * 60);

        block.name = block.subEvents.length > 1 ? `${block.subEvents.length} Overlapping Events` : block.subEvents[0].event;
        block.category = longestEvent.category;
        block.fill = CATEGORY_COLORS[longestEvent.category] || CATEGORY_COLORS.Default;
        block.duration = `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`;
        
        return block;
    });

  }, [extractedData]);
  
  const chartConfig = React.useMemo(() => {
    const config: any = {};
    const categories = new Set(chartData.map(item => item.category));
    categories.forEach(category => {
        config[category] = {
            label: category,
            color: CATEGORY_COLORS[category as string] || CATEGORY_COLORS['Default'],
        };
    });
    return config;
  }, [chartData]);
  
  if (!chartData || chartData.length === 0) {
    return (
       <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          There is no event data to display. Please upload a Statement of Fact to see the analytics dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-6 w-6 text-primary" />
            <span>Event Timeline</span>
          </CardTitle>
          <CardDescription>
            A Gantt-style visualization of all port operation events over time. Overlapping events have been merged.
          </CardDescription>
        </CardHeader>
        <Card className="border-none shadow-none">
            <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="w-full h-[500px]">
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        stackOffset="expand"
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={['dataMin', 'dataMax + 2']} unit="h" />
                        <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} interval={0} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload as MergedEventBlock;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm max-w-sm">
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground" style={{color: data.fill}}>{data.category}</span>
                                                    <span className="font-bold text-foreground">{data.name}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-semibold">
                                                    {data.startTime} - {data.endTime} ({data.duration})
                                                </p>
                                                <div className="border-t pt-2 mt-2">
                                                    <h4 className="text-xs font-bold mb-1">Included Events:</h4>
                                                    <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                                                        {data.subEvents.map((e, i) => <li key={i}>{e.event} ({e.duration})</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Legend content={({ payload }) => {
                           const uniqueCategories = Array.from(new Set(payload?.map(p => (p.payload as any)?.category)));
                            return (
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {uniqueCategories.map((category) => (
                                    <div key={category} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category as string] || CATEGORY_COLORS['Default'] }} />
                                        <span className="text-sm text-muted-foreground">{category}</span>
                                    </div>
                                ))}
                                </div>
                            );
                        }} />
                         <Bar dataKey="time" name="Event" barSize={20} radius={[4, 4, 4, 4]}>
                            {chartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  )
}


export default AnalyticsDashboard;
