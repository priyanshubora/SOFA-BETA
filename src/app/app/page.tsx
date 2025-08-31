
"use client";

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SoFProcessor } from '@/components/sof-processor';
import { Anchor, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import type { ExtractPortOperationEventsOutput } from '@/ai/flows/extract-port-operation-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { parseISO, differenceInHours, format, max, min, differenceInMinutes } from 'date-fns';

// Define the types directly in the frontend now
interface TimelineBlock {
  name: string;
  category?: string;
  time: [number, number];
  duration?: string;
  startTime?: string;
  endTime?: string;
  subEvents: any[];
}

interface LaytimeEvent {
  event: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  isCounted: boolean;
  reason?: string;
}

interface LaytimeCalculation {
  totalLaytime: string;
  allowedLaytime: string;
  timeSaved: string;
  demurrage: string;
  demurrageCost?: string;
  laytimeEvents: LaytimeEvent[];
}


const ClientOceanBackground = dynamic(() => import('@/components/client-ocean-background').then(mod => mod.ClientOceanBackground), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-background -z-10" />
});

const FloatingAiAssistant = dynamic(() => import('@/components/floating-ai-assistant').then(mod => mod.FloatingAiAssistant), {
  ssr: false,
});

const ExtractedEventsView = dynamic(() => import('@/components/extracted-events-view').then(mod => mod.ExtractedEventsView), {
  loading: () => <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>,
});

const LaytimeCalculator = dynamic(() => import('@/components/laytime-calculator').then(mod => mod.LaytimeCalculator), {
    loading: () => <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-64 w-full" /></div>,
});

const AnalyticsDashboard = dynamic(() => import('@/components/analytics-dashboard').then(mod => mod.AnalyticsDashboard), {
    loading: () => <Skeleton className="h-[500px] w-full" />,
});

// Helper to format minutes into a "d h m" string
const formatMinutesToDuration = (totalMinutes: number): string => {
    if (totalMinutes <= 0) return "0m";
    const days = Math.floor(totalMinutes / 1440);
    const remainingMinutes = totalMinutes % 1440;
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = Math.round(remainingMinutes % 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || result === '') result += `${minutes}m`; // show 0m if total is 0
    
    return result.trim();
}


export default function AppPage() {
  const [extractedData, setExtractedData] = useState<ExtractPortOperationEventsOutput | null>(null);

  const enrichedData = useMemo(() => {
    if (!extractedData?.events || extractedData.events.length === 0) {
      return null;
    }
    
    const validEvents = extractedData.events.filter(e => e.startTime && e.endTime);
    if (validEvents.length === 0) return null;

    // 1. Generate Timeline Blocks
    const sortedEvents = [...validEvents].sort((a, b) => parseISO(a.startTime!).getTime() - parseISO(b.startTime!).getTime());
    const firstEventTime = parseISO(sortedEvents[0].startTime!);

    const mergedBlocks: TimelineBlock[] = [];
    if (sortedEvents.length > 0) {
      let currentBlock: TimelineBlock | null = null;

      for (const event of sortedEvents) {
        const eventStart = parseISO(event.startTime!);
        const eventEnd = parseISO(event.endTime!);

        if (!currentBlock) {
          currentBlock = {
            name: event.event,
            category: event.category,
            startTime: format(eventStart, 'MMM d, HH:mm'),
            endTime: format(eventEnd, 'HH:mm'),
            time: [differenceInHours(eventStart, firstEventTime), differenceInHours(eventEnd, firstEventTime)],
            duration: event.duration,
            subEvents: [event],
          };
        } else {
          const blockEndDate = max(currentBlock.subEvents.map(e => parseISO(e.endTime!)));
          
          if (eventStart < blockEndDate) {
            currentBlock.subEvents.push(event);
            const newEndDate = max([blockEndDate, eventEnd]);
            currentBlock.endTime = format(newEndDate, 'HH:mm');
            const blockStartDate = min(currentBlock.subEvents.map(e => parseISO(e.startTime!)));
            currentBlock.time = [differenceInHours(blockStartDate, firstEventTime), differenceInHours(newEndDate, firstEventTime)];
          } else {
            mergedBlocks.push(currentBlock);
            currentBlock = {
              name: event.event,
              category: event.category,
              startTime: format(eventStart, 'MMM d, HH:mm'),
              endTime: format(eventEnd, 'HH:mm'),
              time: [differenceInHours(eventStart, firstEventTime), differenceInHours(eventEnd, firstEventTime)],
              duration: event.duration,
              subEvents: [event],
            };
          }
        }
      }
      if (currentBlock) {
        mergedBlocks.push(currentBlock);
      }
    }
    
    const timelineBlocks = mergedBlocks.map(block => {
        const start = min(block.subEvents.map(e => parseISO(e.startTime!)));
        const end = max(block.subEvents.map(e => parseISO(e.endTime!)));
        const totalDurationMinutes = differenceInMinutes(end, start);
        
        const name = block.subEvents.length > 1 ? `${block.subEvents.length} Overlapping Events` : block.subEvents[0].event;
        const mainCategory = block.subEvents.reduce((longest, current) => {
            if (!longest.startTime || !longest.endTime || !current.startTime || !current.endTime) return longest;
            const longestDuration = differenceInMinutes(parseISO(longest.endTime!), parseISO(longest.startTime!));
            const currentDuration = differenceInMinutes(parseISO(current.endTime!), parseISO(current.startTime!));
            return currentDuration > longestDuration ? current : longest;
        }).category;

        return {
          ...block,
          name,
          category: mainCategory,
          duration: formatMinutesToDuration(totalDurationMinutes),
        }
    });

    // 2. Generate Laytime Calculation
    let totalLaytimeMinutes = 0;
    const laytimeEvents: LaytimeEvent[] = validEvents.map(event => {
      let isCounted = false;
      let reason = "Not counted towards laytime.";
      
      if (event.category === 'Cargo Operations') {
        isCounted = true;
        reason = "Cargo operations count towards laytime.";
      } else if (event.category === 'Delays' || event.category === 'Stoppages') {
        isCounted = false;
        reason = "Delays and stoppages generally do not count.";
      }
      
      const durationMinutes = differenceInMinutes(parseISO(event.endTime!), parseISO(event.startTime!));
      if (isCounted) {
        totalLaytimeMinutes += durationMinutes;
      }
      
      return {
        event: event.event,
        startTime: event.startTime,
        endTime: event.endTime,
        duration: formatMinutesToDuration(durationMinutes),
        isCounted,
        reason,
      };
    });

    const allowedLaytime = "3 days"; // Default
    const allowedLaytimeMinutes = 3 * 24 * 60;
    const difference = allowedLaytimeMinutes - totalLaytimeMinutes;

    const laytimeCalculation: LaytimeCalculation = {
      totalLaytime: formatMinutesToDuration(totalLaytimeMinutes),
      allowedLaytime,
      timeSaved: difference > 0 ? formatMinutesToDuration(difference) : "0m",
      demurrage: difference < 0 ? formatMinutesToDuration(Math.abs(difference)) : "0m",
      laytimeEvents,
    };
    
    // 3. Generate Summary
    const totalTimeInPortMinutes = differenceInMinutes(parseISO(sortedEvents[sortedEvents.length - 1].endTime!), parseISO(sortedEvents[0].startTime!));
    const cargoOpsMinutes = laytimeEvents.filter(e => e.isCounted).reduce((acc, e) => acc + differenceInMinutes(parseISO(e.endTime!), parseISO(e.startTime!)), 0);
    const delayMinutes = validEvents.filter(e => e.category === 'Delays' || e.category === 'Stoppages').reduce((acc, e) => acc + differenceInMinutes(parseISO(e.endTime!), parseISO(e.startTime!)), 0);

    const eventsSummary = `*   **Total time in port:** ${formatMinutesToDuration(totalTimeInPortMinutes)}\n*   **Total time on cargo operations:** ${formatMinutesToDuration(cargoOpsMinutes)}\n*   **Total time lost to delays/stoppages:** ${formatMinutesToDuration(delayMinutes)}`;

    return { ...extractedData, timelineBlocks, laytimeCalculation, eventsSummary };
  }, [extractedData]);

  const handleDataExtracted = (data: ExtractPortOperationEventsOutput) => {
    setExtractedData(data);
  }
  
  const handleReset = () => {
    setExtractedData(null);
  }

  return (
    <div className="relative min-h-screen w-full">
      <ClientOceanBackground />
      <main className="relative z-10 flex flex-col items-center p-4 md:p-8">
        <header className="w-full max-w-7xl flex items-center justify-between p-4 mb-4 md:mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-background p-3 rounded-full neumorphic-outset">
              <Anchor className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-foreground/80 md:text-3xl">SOFA</h1>
              <p className="text-xs text-muted-foreground md:block">Smart Laytime Event Extractor</p>
            </div>
          </div>
           <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" className="neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200">
                    <HomeIcon className="h-4 w-4" />
                </Button>
              </Link>
              <ThemeToggle />
          </div>
        </header>

        <div className="w-full max-w-7xl grid grid-cols-1 gap-8 flex-1">
            {!enrichedData ? (
                <div className="max-w-3xl mx-auto w-full p-4 md:p-6 rounded-lg neumorphic-outset">
                    <SoFProcessor 
                        onDataExtracted={handleDataExtracted} 
                    />
                </div>
            ) : (
                <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className='space-y-1'>
                            <h2 className="text-2xl font-bold tracking-tight">Vessel: {enrichedData.vesselName}</h2>
                            <p className="text-muted-foreground">
                                Analysis dashboard for the processed Statement of Fact.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleReset} className="neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Process New SoF
                        </Button>
                    </div>

                    <Tabs defaultValue="events" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-transparent rounded-lg neumorphic-inset p-1">
                            <TabsTrigger value="events" className="data-[state=active]:neumorphic-outset data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">Extracted Events</TabsTrigger>
                            <TabsTrigger value="laytime" disabled={!enrichedData.laytimeCalculation} className="data-[state=active]:neumorphic-outset data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">Laytime Analytics</TabsTrigger>
                            <TabsTrigger value="timeline" className="data-[state=active]:neumorphic-outset data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">Event Timeline</TabsTrigger>
                        </TabsList>
                        <TabsContent value="events" className="mt-6">
                            <div className="p-4 md:p-6 neumorphic-outset rounded-lg">
                                <ExtractedEventsView extractedData={enrichedData} />
                            </div>
                        </TabsContent>
                        <TabsContent value="laytime" className="mt-6">
                            <div className="p-4 md:p-6 neumorphic-outset rounded-lg">
                                <LaytimeCalculator laytimeResult={enrichedData.laytimeCalculation || null} />
                            </div>
                        </TabsContent>
                        <TabsContent value="timeline" className="mt-6">
                             <div className="p-4 md:p-6 neumorphic-outset rounded-lg">
                                <AnalyticsDashboard timelineBlocks={enrichedData.timelineBlocks || []} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
      </main>
      <FloatingAiAssistant extractedData={enrichedData} />
    </div>
  );
}
