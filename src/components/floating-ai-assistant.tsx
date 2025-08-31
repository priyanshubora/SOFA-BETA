"use client";

import { useState, useRef, useEffect } from "react";
import { guideNewUsers } from "@/ai/flows/guide-new-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { Badge } from "./ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FloatingAiAssistantProps {
  extractedData: any | null; // Allow any for enrichedData
}

export function FloatingAiAssistant({ extractedData }: FloatingAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewInsight, setHasNewInsight] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm the SOFA assistant. I can help you use the app or provide insights on your uploaded Statement of Fact. How can I help?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const scrollableNode = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollableNode) {
            scrollableNode.scrollTo({
                top: scrollableNode.scrollHeight,
                behavior: "smooth"
            });
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (isOpen) {
        setHasNewInsight(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (extractedData?.eventsSummary) {
        const insightMessage: Message = { role: "assistant", content: `Here are some insights for **${extractedData.vesselName}**:\n\n${extractedData.eventsSummary}` };
        setMessages(prev => [...prev, insightMessage]);
        setHasNewInsight(true);
    } else if (extractedData) {
        const insightMessage: Message = { role: "assistant", content: `I've successfully extracted the events for **${extractedData.vesselName}**. However, I was unable to generate an automated summary for this document.` };
        setMessages(prev => [...prev, insightMessage]);
        setHasNewInsight(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractedData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // If there is data, we assume the user might be asking about it.
      // A more advanced implementation could use a tool-based router here.
      const result = await guideNewUsers({ query: currentInput });
      if (result && result.response) {
        const assistantMessage: Message = { role: "assistant", content: result.response };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response from AI assistant.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-20">
            <MessageSquare size={32} />
            {hasNewInsight && <Badge color="yellow" className="absolute -top-1 -right-1 bg-accent text-accent-foreground"><Sparkles className="h-4 w-4" /></Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0 w-full max-w-md">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span>AI Assistant</span>
          </SheetTitle>
          <SheetDescription>
            Ask about the app or for insights on your SoF data.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                        </Avatar>
                        )}
                        <div className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-wrap ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <div className="p-0 text-sm" dangerouslySetInnerHTML={{ __html: message.content.replace(/\\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                        {message.role === 'user' && (
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback><User size={20}/></AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg px-4 py-2 bg-muted flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Explain the delays"
                    disabled={isLoading}
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90 shrink-0">
                    <Send className="h-4 w-4 text-accent-foreground" />
                </Button>
                </form>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
