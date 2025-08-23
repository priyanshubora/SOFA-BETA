
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientOceanBackground } from '@/components/client-ocean-background';
import { ThemeToggle } from '@/components/theme-toggle';
import { Anchor, ArrowRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <ClientOceanBackground />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <header className="w-full max-w-5xl flex items-center justify-between absolute top-0 left-1/2 -translate-x-1/2 p-4">
          <div className="flex items-center gap-3">
             <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full neumorphic-outset">
              <Anchor className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground/80 hidden md:block">SOFA</h1>
          </div>
           <div className="flex items-center gap-2">
                <Link href="/about">
                    <Button variant="outline" className="neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200">
                        <Info className="mr-2 h-4 w-4" /> About
                    </Button>
                </Link>
                <ThemeToggle />
          </div>
        </header>

        <Card className="max-w-2xl text-center bg-background/50 backdrop-blur-sm neumorphic-outset animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
              Welcome to SOFA
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground mt-4">
              Your AI-Powered Solution for Maritime Laytime Intelligence & Analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-8 text-foreground/80">
              Automatically extract port operation events from Statements of Fact, calculate laytime, and gain actionable insights to optimize your maritime logistics.
            </p>
            <Link href="/app">
              <Button size="lg" className="group neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
