
"use client"

import type { ExtractPortOperationEventsOutput } from "@/ai/flows/extract-port-operation-events";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ListTree, Ship, GanttChartSquare, Anchor, Weight, CalendarClock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface ExtractedEventsViewProps {
  extractedData: ExtractPortOperationEventsOutput;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
            <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold text-foreground">{value}</p>
            </div>
        </div>
    )
}

export function ExtractedEventsView({ extractedData }: ExtractedEventsViewProps) {
  
  const downloadJSON = () => {
    if (!extractedData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(extractedData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${extractedData.vesselName.replace(/\s+/g, '_')}_sof_events.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const groupedEvents = useMemo(() => {
    if (!extractedData) return {};
    return extractedData.events.reduce((acc, event) => {
      const category = event.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(event);
      return acc;
    }, {} as Record<string, typeof extractedData.events>);
  }, [extractedData]);

  if (!extractedData || extractedData.events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Events Found</CardTitle>
          <CardDescription>Could not find any events in the provided document.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
        <div className="space-y-4">
             <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                    <Ship className="h-6 w-6 text-primary" />
                    Vessel & Voyage Details
                </CardTitle>
             </CardHeader>
             <Card className="border-none shadow-none">
                <CardContent className="p-0">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={GanttChartSquare} label="Port of Call" value={extractedData.portOfCall} />
                        <DetailItem icon={Anchor} label="Berth" value={extractedData.berth} />
                        <DetailItem icon={ListTree} label="Voyage Number" value={extractedData.voyageNumber} />
                        <DetailItem icon={Weight} label="Cargo" value={extractedData.cargoDescription} />
                        <DetailItem icon={Weight} label="Cargo Quantity" value={extractedData.cargoQuantity} />
                        <DetailItem icon={CalendarClock} label="NOR Tendered" value={extractedData.noticeOfReadinessTendered} />
                   </div>
                </CardContent>
             </Card>
        </div>


        <div className="space-y-4">
            <CardHeader className="p-0">
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="flex items-center gap-2"><ListTree className="h-6 w-6 text-primary" /> Raw Extracted Events</CardTitle>
                      <CardDescription className="pt-2">
                        The complete list of events and remarks extracted from the Statement of Fact.
                      </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadJSON}>
                      <Download className="mr-2 h-4 w-4" />
                      Download JSON
                  </Button>
              </div>
            </CardHeader>
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <Accordion type="multiple" defaultValue={Object.keys(groupedEvents)} className="w-full">
                  {Object.entries(groupedEvents).map(([category, events]) => (
                    <AccordionItem value={category} key={category}>
                      <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:no-underline px-1 py-4">
                        <div className="flex items-center gap-2">
                            <span>{category}</span>
                            <Badge variant="secondary">{events.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{event.event}</TableCell>
                                        <TableCell>{event.startTime}</TableCell>
                                        <TableCell>{event.endTime}</TableCell>
                                        <TableCell>{event.duration}</TableCell>
                                        <TableCell><Badge variant={event.status === 'Completed' ? 'default' : 'destructive'} className={cn(event.status === 'Completed' && "bg-green-600")}>{event.status}</Badge></TableCell>
                                        <TableCell>{event.remark}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
        </div>
    </div>
  )
}
