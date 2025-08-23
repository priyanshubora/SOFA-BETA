
"use client";

import {
  type LaytimeCalculation,
} from "@/ai/flows/extract-port-operation-events";
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
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Save,
  Hourglass,
  CircleDollarSign,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface LaytimeCalculatorProps {
  laytimeResult: LaytimeCalculation | null;
}

export function LaytimeCalculator({ laytimeResult }: LaytimeCalculatorProps) {
  if (!laytimeResult) {
    return (
      <Alert className="neumorphic-outset rounded-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Laytime Data</AlertTitle>
        <AlertDescription>
          This may happen if the AI could not reliably calculate laytime from the provided document.
        </AlertDescription>
      </Alert>
    );
  }

  const hasDemurrage = laytimeResult.demurrage && laytimeResult.demurrage !== "0" && laytimeResult.demurrage !== "N/A" && !laytimeResult.demurrage.startsWith("0h");

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <span>Laytime Calculation Summary</span>
          </CardTitle>
          <CardDescription>
            A detailed analysis of the vessel's time in port based on the
            Statement of Fact.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="neumorphic-outset rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Laytime Used</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{laytimeResult.totalLaytime}</div>
                    <p className="text-xs text-muted-foreground">Total time counted against allowable laytime.</p>
                </CardContent>
            </Card>
            <Card className="neumorphic-outset rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Allowed Laytime</CardTitle>
                    <Hourglass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{laytimeResult.allowedLaytime}</div>
                    <p className="text-xs text-muted-foreground">As per charter party agreement (default).</p>
                </CardContent>
            </Card>
             <Card className="neumorphic-outset rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Time Saved (Despatch)</CardTitle>
                    <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{laytimeResult.timeSaved}</div>
                     <p className="text-xs text-muted-foreground">Operations completed ahead of schedule.</p>
                </CardContent>
            </Card>
            <Card className="neumorphic-outset rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Extra Time (Demurrage)</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{laytimeResult.demurrage}</div>
                     <p className="text-xs text-muted-foreground">Operations exceeded the allowed time.</p>
                </CardContent>
            </Card>
        </div>
        
        {hasDemurrage && laytimeResult.demurrageCost && (
             <Card className="neumorphic-outset rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Estimated Demurrage Cost</CardTitle>
                    <CircleDollarSign className="h-4 w-4 text-red-600 dark:text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">{laytimeResult.demurrageCost}</div>
                    <p className="text-xs text-red-600 dark:text-red-500">Based on a standard rate of $20,000/day.</p>
                </CardContent>
            </Card>
        )}

        <Card className="neumorphic-outset rounded-lg">
          <CardHeader>
            <CardTitle>Laytime Event Breakdown</CardTitle>
            <CardDescription>
              Analysis of each port event and its contribution to the total
              laytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-center">Counted?</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laytimeResult.laytimeEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.event}</TableCell>
                    <TableCell>{event.duration}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={event.isCounted ? "default" : "secondary"}
                        className={cn(
                            "text-white neumorphic-outset",
                            event.isCounted ? "bg-blue-600" : "bg-gray-500",
                        )}
                      >
                        {event.isCounted ? (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {event.isCounted ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center">
                      {event.reason}{" "}
                      {event.reason && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="neumorphic-outset rounded-lg">
                            <p>{event.reason}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
