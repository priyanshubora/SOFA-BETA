
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Anchor, ArrowRight, Info, Zap, Scale, LayoutDashboard, UploadCloud, BrainCircuit, BarChart2, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative min-h-screen w-full text-white">
        <div className="absolute inset-0 z-0">
          <video
            src="https://videos.pexels.com/video-files/2344546/2344546-uhd_2560_1440_25fps.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <main className="relative z-10 flex flex-col min-h-screen">
          <header className="w-full flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                <Anchor className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white hidden md:block">SOFA</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/about">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Info className="mr-2 h-4 w-4" /> About
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-4xl space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                Maritime Intelligence, <span className="text-primary">Redefined</span>.
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                SOFA brings clarity to complex port operations. Instantly process
                Statements of Fact, calculate laytime, and unlock data-driven
                insights with the power of AI.
              </p>
              <div className="pt-4">
                <Link href="/app">
                  <Button
                    size="lg"
                    className="group bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 text-lg px-8 py-6"
                  >
                    Analyze a Document
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-sm text-white/70">Learn More</span>
                <ArrowDown className="h-5 w-5 text-white/70" />
            </div>
        </main>
      </div>

      {/* Key Features Section */}
      <section id="features" className="py-20 md:py-28 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SOFA?</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-12">
                Our platform transforms tedious port documents into actionable intelligence, saving you time and money.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-left animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-150">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                       <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Instant AI Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Stop waiting hours. Our AI processes complex Statement of Fact documents in seconds, extracting every critical event with precision.</p>
                </CardContent>
              </Card>
              <Card className="text-left animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                       <Scale className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Accurate Laytime</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Eliminate costly human errors and disputes. Get standardized, verifiable laytime calculations based on your SoF data.</p>
                </CardContent>
              </Card>
              <Card className="text-left animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-500">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                       <LayoutDashboard className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Clear Dashboards</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Understand your port call at a glance with intuitive charts and timelines that visualize key performance indicators.</p>
                </CardContent>
              </Card>
            </div>
        </div>
      </section>

      {/* How It Works Section */}
       <section id="how-it-works" className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-16">
              From raw documents to rich insights in under a minute.
            </p>
            <div className="relative">
              {/* The connecting line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                  <div className="flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-150">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border-2 border-primary mb-4 z-10">
                          <UploadCloud className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">1. Upload SoF</h3>
                      <p className="text-muted-foreground text-center">Drag and drop or select your Statement of Fact file (.docx, .pdf, or .txt).</p>
                  </div>
                  <div className="flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-300">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border-2 border-primary mb-4 z-10">
                           <BrainCircuit className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">2. AI Analyzes</h3>
                      <p className="text-muted-foreground text-center">Our AI reads the document, extracts events, and performs laytime calculations.</p>
                  </div>
                   <div className="flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-500">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border-2 border-primary mb-4 z-10">
                           <BarChart2 className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">3. Visualize Data</h3>
                      <p className="text-muted-foreground text-center">Explore your interactive dashboard with timelines, summaries, and breakdowns.</p>
                  </div>
              </div>
            </div>
          </div>
       </section>

    </div>
  );
}
