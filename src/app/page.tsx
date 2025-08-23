
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Anchor, ArrowRight, Info } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full text-white">
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://placehold.co/1920x1080.png"
          alt="Ocean background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="brightness-75"
          data-ai-hint="ocean waves"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <main className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
              <Anchor className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white hidden md:block">SOFA</h1>
          </div>
           <div className="flex items-center gap-2">
                <Link href="/about">
                    <Button variant="outline" className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white transition-all duration-200">
                        <Info className="mr-2 h-4 w-4" /> About
                    </Button>
                </Link>
                <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-4xl space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
                    Maritime Intelligence, <span className="text-primary">Redefined</span>.
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                   SOFA brings clarity to complex port operations. Instantly process Statements of Fact, calculate laytime, and unlock data-driven insights with the power of AI.
                </p>
                <div className="pt-4">
                    <Link href="/app">
                    <Button size="lg" className="group bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 text-lg px-8 py-6">
                        Analyze a Document
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    </Link>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
