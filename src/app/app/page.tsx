
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SoFProcessor } from '@/components/sof-processor';
import { Anchor, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import type { ExtractPortOperationEventsOutput } from '@/ai/flows/extract-port-operation-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LaytimeCalculator } from '@/components/laytime-calculator';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { Button } from '@/components/ui/button';
import { ExtractedEventsView } from '@/components/extracted-events-view';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const ClientOceanBackground = dynamic(() => import('@/components/client-ocean-background').then(mod => mod.ClientOceanBackground), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-background -z-10" />
});

const FloatingAiAssistant = dynamic(() => import('@/components/floating-ai-assistant').then(mod => mod.FloatingAiAssistant), {
  ssr: false,
});


export default function AppPage() {
  const [extractedData, setExtractedData] = useState<ExtractPortOperationEventsOutput | null>(null);

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
            {!extractedData ? (
                <div className="max-w-3xl mx-auto w-full p-4 md:p-6 rounded-lg neumorphic-outset">
                    <SoFProcessor 
                        onDataExtracted={handleDataExtracted} 
                    />
                </div>
            ) : (
                <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className='space-y-1'>
                            <h2 className="text-2xl font-bold tracking-tight">Vessel: {extractedData.vesselName}</h2>
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
                                <ExtractedEventsView extractedData={extractedData} />
                            </div>
                        </TabsContent>
                        <TabsContent value="laytime" className="mt-6">
                            <div className="p-4 md:p-6 neumorphic-outset rounded-lg">
                                <LaytimeCalculator laytimeResult={extractedData.laytimeCalculation} />
                            </div>
                        </TabsContent>
                        <TabsContent value="timeline" className="mt-6">
                             <div className="p-4 md:p-6 neumorphic-outset rounded-lg">
                                <AnalyticsDashboard extractedData={extractedData} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
      </main>
      <FloatingAiAssistant extractedData={extractedData} />
    </div>
  );
}
