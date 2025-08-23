
"use client";

import { useCallback, useState } from "react";
import * as mammoth from "mammoth";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { extractPortOperationEvents } from "@/ai/flows/extract-port-operation-events";
import type { ExtractPortOperationEventsOutput } from "@/ai/flows/extract-port-operation-events";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, UploadCloud, File as FileIcon, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface SoFProcessorProps {
  onDataExtracted: (data: ExtractPortOperationEventsOutput) => void;
}

export function SoFProcessor({ onDataExtracted }: SoFProcessorProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/pdf': ['.pdf'],
        'text/plain': ['.txt'],
    }
  });

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          mammoth.extractRawText({ arrayBuffer })
            .then(result => resolve(result.value))
            .catch(reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsText(file);
      }
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please upload a file to process.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const textContent = await fileToText(file);
      const result = await extractPortOperationEvents({ sofContent: textContent });
      if (result && result.events && result.vesselName) {
        onDataExtracted(result);
        toast({
          title: "Extraction Successful",
          description: `Extracted ${result.events.length} events for vessel ${result.vesselName}.`,
        });
      } else {
        throw new Error("Invalid response from AI. Missing events or vessel name.");
      }
    } catch (error) {
      const e = error as Error;
      console.error(e);

      if (e.message && (e.message.includes('429') || e.message.includes('Too Many Requests') || e.message.includes('exceeded your current quota'))) {
         toast({
            variant: "destructive",
            title: "API Quota Exceeded",
            description: "You have exceeded your daily/minute limit. Please ensure you are using a Gemini Pro API key and that billing is enabled in your Google Cloud project.",
         });
      } else {
        toast({
            variant: "destructive",
            title: "Extraction Failed",
            description: e.message || "Could not extract events. Please check the file and try again.",
        });
      }
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleClear = () => {
    setFile(null);
  };

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span>SoF Event Extractor</span>
        </CardTitle>
        <CardDescription>
          Upload a Statement of Fact (SoF) file (.docx, .pdf, or .txt) to begin.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div {...getRootProps()} className={cn("group relative flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer transition-all duration-200 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 neumorphic-outset active:neumorphic-inset", isDragActive && "border-primary bg-primary/10 neumorphic-inset", isSubmitting && "animate-pulse")}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center p-6">
                     <svg
                        className={cn("w-16 h-16 mb-4 text-muted-foreground transition-colors", isDragActive ? "text-primary" : "group-hover:text-primary/80")}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    {isDragActive ? (
                        <p className="text-lg font-semibold text-primary">Drop the file here to start processing</p>
                    ) : (
                        <>
                            <p className="mb-2 text-md font-semibold text-foreground"><span className="text-primary">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Supports DOCX, PDF, or TXT files</p>
                        </>
                    )}
                </div>
            </div>

            {file && file.size > 0 ? (
              <div className="flex items-center justify-between p-2 mt-2 text-sm rounded-md neumorphic-inset">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{file.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 rounded-full neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting || !file} className="w-full neumorphic-outset neumorphic-outset-hover neumorphic-inset-active transition-all duration-200">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Extracting Events...' : 'Process Statement of Fact'}
            </Button>
        </form>
      </CardContent>
    </>
  )
}
