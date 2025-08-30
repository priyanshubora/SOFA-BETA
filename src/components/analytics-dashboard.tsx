
"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, ResponsiveContainer } from "recharts"

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"
import type { TimelineBlock } from "@/ai/flows/extract-port-operation-events";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, BarChart as BarChartIcon } from "lucide-react";

interface AnalyticsDashboardProps {
  timelineBlocks: TimelineBlock[];
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


export function AnalyticsDashboard({ timelineBlocks }: AnalyticsDashboardProps) {
  
  const chartData = React.useMemo(() => {
    return timelineBlocks.map(block => ({
        ...block,
        fill: CATEGORY_COLORS[block.category] || CATEGORY_COLORS.Default,
    }));
  }, [timelineBlocks]);
  
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
        <div className="border-none shadow-none">
            <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="w-full h-[500px]">
                    <ResponsiveContainer>
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
                                        const data = payload[0].payload as TimelineBlock & { fill: string };
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
                                                            {data.subEvents.map((e: any, i) => <li key={i}>{e.event} ({e.duration})</li>)}
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
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </div>
    </div>
  )
}


export default AnalyticsDashboard;
