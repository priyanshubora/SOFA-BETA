
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientOceanBackground } from '@/components/client-ocean-background';
import { ThemeToggle } from '@/components/theme-toggle';
import { Anchor, ArrowLeft, Users, Zap, BrainCircuit, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <ClientOceanBackground />
      <main className="relative z-10 flex flex-col items-center min-h-screen p-4 md:p-8">
        <header className="w-full max-w-5xl flex items-center justify-between absolute top-0 left-1/2 -translate-x-1/2 p-4">
          <div className="flex items-center gap-3">
             <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full neumorphic-outset">
              <Anchor className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground/80 hidden md:block">SOFA</h1>
          </div>
           <div className="flex items-center gap-2">
                <Link href="/">
                    <Button variant="outline" className="neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>
                <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center w-full">
            <Card className="max-w-4xl bg-background/50 backdrop-blur-sm neumorphic-outset animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
            <CardHeader className="text-center">
                <CardTitle className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                About SOFA
                </CardTitle>
                <CardDescription className="text-lg md:text-xl text-muted-foreground mt-4">
                Redefining Maritime Logistics with Artificial Intelligence
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6 md:p-8">
                <p className="text-center text-foreground/80">
                SOFA (Statement of Fact Analyzer) is a cutting-edge platform designed to bring clarity and efficiency to the complex world of maritime logistics. We leverage state-of-the-art AI to automate the tedious and error-prone process of analyzing port documents, allowing stakeholders to make faster, data-driven decisions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2 p-4 rounded-lg neumorphic-inset">
                        <Zap className="h-10 w-10 text-accent mx-auto" />
                        <h3 className="text-xl font-bold">Efficiency</h3>
                        <p className="text-muted-foreground">Instantly process documents that traditionally take hours, freeing up valuable time for your team to focus on strategic operations.</p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg neumorphic-inset">
                        <BrainCircuit className="h-10 w-10 text-accent mx-auto" />
                        <h3 className="text-xl font-bold">Accuracy</h3>
                        <p className="text-muted-foreground">Eliminate human error. Our AI model is trained to precisely extract events, calculate laytime, and identify costly delays.</p>
                    </div>
                     <div className="space-y-2 p-4 rounded-lg neumorphic-inset">
                        <Users className="h-10 w-10 text-accent mx-auto" />
                        <h3 className="text-xl font-bold">Our Mission</h3>
                        <p className="text-muted-foreground">Our mission is to empower maritime professionals with intelligent tools that enhance transparency, reduce disputes, and optimize port-call operations.</p>
                    </div>
                </div>

                <div className="text-center pt-4 space-y-6">
                    <div className="p-4 rounded-lg neumorphic-inset">
                        <div className="flex items-center justify-center gap-2">
                             <Code className="h-6 w-6 text-accent" />
                             <h3 className="text-xl font-bold">Created By</h3>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Rohan Nautiyal, Shubham Rana, Yashvir Singh Negi, and Priyanshu Bora
                        </p>
                    </div>

                    <Link href="/app">
                    <Button size="lg" className="group neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200">
                        Analyze a Document Now
                    </Button>
                    </Link>
                </div>
            </CardContent>
            </Card>
        </div>

      </main>
    </div>
  );
}
