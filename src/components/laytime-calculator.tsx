
"use client";

import { useState, useMemo, useEffect } from "react";
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
  PenSquare,
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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

interface LaytimeCalculatorProps {
  laytimeResult: LaytimeCalculation | null;
}

const CURRENCIES = {
  USD: { symbol: "$", rate: 1 },
  INR: { symbol: "₹", rate: 83.5 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
};
type Currency = keyof typeof CURRENCIES;

// Helper to parse strings like "2 days, 4 hours, 30 minutes" into total hours
const parseDurationToHours = (durationStr: string): number => {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  
  let totalHours = 0;
  const daysMatch = durationStr.match(/(\d+)\s*day/);
  const hoursMatch = durationStr.match(/(\d+)\s*hour/);
  const minutesMatch = durationStr.match(/(\d+)\s*minute/);

  if (daysMatch) totalHours += parseInt(daysMatch[1], 10) * 24;
  if (hoursMatch) totalHours += parseInt(hoursMatch[1], 10);
  if (minutesMatch) totalHours += parseInt(minutesMatch[1], 10) / 60;
  
  return totalHours;
};

// Helper to format hours into a "d h m" string
const formatHoursToDuration = (totalHours: number): string => {
    if (totalHours <= 0) return "0h 0m";
    const days = Math.floor(totalHours / 24);
    const remainingHours = Math.floor(totalHours % 24);
    const minutes = Math.round((totalHours - (days * 24) - remainingHours) * 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (remainingHours > 0) result += `${remainingHours}h `;
    if (minutes > 0) result += `${minutes}m`;
    
    return result.trim();
}

export function LaytimeCalculator({ laytimeResult }: LaytimeCalculatorProps) {
  const [allowedLaytimeDays, setAllowedLaytimeDays] = useState(3);
  const [demurrageRate, setDemurrageRate] = useState(20000);
  const [rateCurrency, setRateCurrency] = useState<Currency>("USD");
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("USD");

  const initialTotalLaytimeHours = useMemo(() => {
    return parseDurationToHours(laytimeResult?.totalLaytime || "");
  }, [laytimeResult?.totalLaytime]);

  useEffect(() => {
    if (laytimeResult?.allowedLaytime) {
        setAllowedLaytimeDays(parseDurationToHours(laytimeResult.allowedLaytime) / 24);
    }
  }, [laytimeResult?.allowedLaytime]);


  const calculation = useMemo(() => {
    const allowedHours = allowedLaytimeDays * 24;
    const difference = allowedHours - initialTotalLaytimeHours;

    const timeSaved = difference > 0 ? difference : 0;
    const demurrage = difference < 0 ? Math.abs(difference) : 0;
    
    const demurrageCostInUsd = (demurrage / 24) * (demurrageRate / CURRENCIES[rateCurrency].rate);

    return {
        timeSaved: formatHoursToDuration(timeSaved),
        demurrage: formatHoursToDuration(demurrage),
        demurrageCost: demurrageCostInUsd * CURRENCIES[displayCurrency].rate,
    }
  }, [allowedLaytimeDays, demurrageRate, initialTotalLaytimeHours, rateCurrency, displayCurrency]);

  const displayedDemurrageCost = useMemo(() => {
     return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: displayCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
     }).format(calculation.demurrageCost);
  }, [calculation.demurrageCost, displayCurrency]);
  
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

  const hasDemurrage = calculation.demurrage && calculation.demurrage !== "0h 0m";

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <span>Laytime Calculation Summary</span>
          </CardTitle>
          <CardDescription>
            A detailed analysis of the vessel's time in port. Default values are based on the AI's analysis.
          </CardDescription>
        </CardHeader>
        
        <Card className="neumorphic-outset rounded-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <PenSquare className="h-5 w-5 text-muted-foreground" />
                    Interactive Calculator
                </CardTitle>
                <CardDescription>
                    Adjust the parameters below to dynamically recalculate laytime, despatch, and demurrage.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="allowed-laytime">Allowed Laytime (in days)</Label>
                    <Input 
                        id="allowed-laytime" 
                        type="number"
                        value={allowedLaytimeDays}
                        onChange={(e) => setAllowedLaytimeDays(parseFloat(e.target.value) || 0)}
                        className="font-semibold"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="demurrage-rate">Demurrage Rate (per day)</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="demurrage-rate"
                            type="number"
                            value={demurrageRate}
                            onChange={(e) => setDemurrageRate(parseInt(e.target.value, 10) || 0)}
                            className="font-semibold"
                        />
                        <Select value={rateCurrency} onValueChange={(value) => setRateCurrency(value as Currency)}>
                            <SelectTrigger id="currency" className="w-32">
                                <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(CURRENCIES).map(key => (
                                     <SelectItem key={key} value={key}>{key}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>


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
                    <div className="text-2xl font-bold">{allowedLaytimeDays} Days</div>
                    <p className="text-xs text-muted-foreground">As per your input above.</p>
                </CardContent>
            </Card>
             <Card className="neumorphic-outset rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Time Saved (Despatch)</CardTitle>
                    <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{calculation.timeSaved}</div>
                     <p className="text-xs text-muted-foreground">Operations completed ahead of schedule.</p>
                </CardContent>
            </Card>
            <Card className="neumorphic-outset rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Extra Time (Demurrage)</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{calculation.demurrage}</div>
                     <p className="text-xs text-muted-foreground">Operations exceeded the allowed time.</p>
                </CardContent>
            </Card>
        </div>
        
        {hasDemurrage && (
             <Card className="neumorphic-outset rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
                <CardHeader>
                     <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center justify-between">
                         <span>Estimated Demurrage Cost</span>
                         <CircleDollarSign className="h-4 w-4 text-red-600 dark:text-red-500" />
                     </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="text-3xl font-bold text-red-700 dark:text-red-400">{displayedDemurrageCost}</div>
                        <div className="flex items-center gap-2 pb-1">
                            <Label htmlFor="display-currency" className="text-xs text-red-600 dark:text-red-500">View in:</Label>
                            <Select value={displayCurrency} onValueChange={(value) => setDisplayCurrency(value as Currency)}>
                                <SelectTrigger id="display-currency" className="w-24 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(CURRENCIES).map(key => (
                                        <SelectItem key={key} value={key} className="text-xs">{key}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">Based on a rate of {demurrageRate.toLocaleString()} {rateCurrency}/day.</p>
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
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="neumorphic-outset rounded-lg max-w-xs">
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
