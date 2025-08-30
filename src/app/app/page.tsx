
"use client";

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SoFProcessor } from '@/components/sof-processor';
import { Anchor, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import type { ExtractPortOperationEventsOutput, TimelineBlock } from '@/ai/flows/extract-port-operation-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { parseISO, differenceInHours, format, max, min } from 'date-fns';

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

export default function AppPage() {
  const [extractedData, setExtractedData] = useState<ExtractPortOperationEventsOutput | null>(null);

  const enrichedData = useMemo(() => {
    if (!extractedData?.events || extractedData.events.length === 0) {
      return extractedData;
    }
     // Sort events by start time, which is crucial for merging
    const sortedEvents = [...extractedData.events].sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    const firstEventTime = parseISO(sortedEvents[0].startTime);

    // Merge overlapping or adjacent events into blocks
    const mergedBlocks: TimelineBlock[] = [];
    if (sortedEvents.length > 0) {
      let currentBlock: TimelineBlock | null = null;

      for (const event of sortedEvents) {
        const eventStart = parseISO(event.startTime);
        const eventEnd = parseISO(event.endTime);

        if (currentBlock === null) {
          // Start the first block
          currentBlock = {
            name: 'Block', // Placeholder name
            category: 'Timeline',
            subEvents: [event],
            startTime: format(eventStart, 'MMM d, HH:mm'),
            endTime: format(eventEnd, 'HH:mm'),
            time: [differenceInHours(eventStart, firstEventTime), differenceInHours(eventEnd, firstEventTime)],
            duration: event.duration,
          };
        } else {
          const blockEndDate = max(currentBlock.subEvents.map(e => parseISO(e.endTime)));
          
          // Check for overlap: event starts before the current block ends
          if (eventStart.getTime() < blockEndDate.getTime()) {
            currentBlock.subEvents.push(event);
            const blockStartDate = parseISO(currentBlock.subEvents[0].startTime);
            
            const newEndDate = max([blockEndDate, eventEnd]);
            currentBlock.endTime = format(newEndDate, 'HH:mm');
            currentBlock.time = [differenceInHours(blockStartDate, firstEventTime), differenceInHours(newEndDate, firstEventTime)];
          } else {
            mergedBlocks.push(currentBlock);
            currentBlock = {
              name: 'Block',
              category: 'Timeline',
              subEvents: [event],
              startTime: format(eventStart, 'MMM d, HH:mm'),
              endTime: format(eventEnd, 'HH:mm'),
              time: [differenceInHours(eventStart, firstEventTime), differenceInHours(eventEnd, firstEventTime)],
              duration: event.duration,
            };
          }
        }
      }
      if (currentBlock) {
        mergedBlocks.push(currentBlock);
      }
    }
    
    // Post-process blocks to determine name, color, and final duration
    const finalBlocks = mergedBlocks.map(block => {
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
        const minutes = Math.round((totalDurationHours - (days * 24) - hours) * 60);

        return {
          ...block,
          name: block.subEvents.length > 1 ? `${block.subEvents.length} Overlapping Events` : block.subEvents[0].event,
          category: longestEvent.category,
          duration: `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`,
        }
    });

    return { ...extractedData, timelineBlocks: finalBlocks };

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
                            <TabsTrigger value="laytime" className="data-[state=active]:neumorphic-outset data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">Laytime Analytics</TabsTrigger>
                            <TabsTrigger value="timeline" className="data-[state=active]:neumorphic-outset data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">Event Timeline</TabsTrigger>
                        </TabsList>
                        <TabsContent value="events" className="mt-6">
                            <div className="p-4 md:p-6 neumorphic-outset rounded-lg">
                                <ExtractedEventsView extractedData={enrichedData} />
                            </div>
                        </TabsContent>
                        <TabsContent value="laytime" className="mt-6">
                            <div className="p-4 md:p-6 neumorphic-outset rounded-lg">
                                <LaytimeCalculator laytimeResult={enrichedData.laytimeCalculation} />
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
