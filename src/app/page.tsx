"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Anchor, ArrowRight, Info } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen w-full bg-background text-foreground p-4 md:p-6">
      
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-muted p-3 rounded-full border border-border">
            <Anchor className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground hidden md:block">SOFA</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/about">
            <Button variant="outline" className="neumorphic-outset neumorphic-outset-hover neumorphic-inset-active">
              <Info className="mr-2 h-4 w-4" /> About
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
            Maritime Intelligence, <span className="text-primary">Redefined</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
             SOFA brings clarity to complex port operations. Instantly process Statements of Fact, calculate laytime, and unlock data-driven insights with the power of AI.
          </p>
          <div className="pt-4">
            <Link href="/app">
              <Button size="lg" className="group text-lg px-8 py-6">
                Analyze a Document
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </main>
  );
}