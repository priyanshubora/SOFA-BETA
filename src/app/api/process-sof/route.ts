
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { extractPortOperationEvents } from "@/ai/flows/extract-port-operation-events";

// Ensure the API runs on the Node.js runtime
export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Extracts raw text from a DOCX or PDF file.
 * @param file The file to extract text from.
 * @returns A promise that resolves with the extracted text content.
 */
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const result = await pdfParse(buffer);
    return result.text;
  }
  
  // This case should ideally not be reached due to frontend validation
  throw new Error("Unsupported file type. Please upload a DOCX or PDF.");
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }
    
    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File size exceeds the 10MB limit." }, { status: 413 });
    }
    
    // Server-side validation for file type
    const isSupported = file.name.endsWith(".docx") || file.name.endsWith(".pdf");
    if(!isSupported) {
        return NextResponse.json({ error: "Unsupported file type. Only .docx and .pdf are accepted." }, { status: 415 });
    }

    const sofContent = await extractText(file);

    if (!sofContent || sofContent.trim().length < 50) {
        return NextResponse.json({ error: "Failed to extract meaningful content from the file. It may be empty, corrupted, or password-protected." }, { status: 400 });
    }

    const result = await extractPortOperationEvents({ sofContent });
    
    if (!result || !result.vesselName) {
        return NextResponse.json({ error: "The AI failed to analyze the document. The content might not resemble a Statement of Fact." }, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    const e = error as Error;
    console.error("Error processing SoF:", e);
    
    // Provide more specific error messages based on the error type
    let errorMessage = "An unexpected error occurred on the server.";
    if (e.message.includes("Unsupported file type")) {
        errorMessage = e.message;
    } else if (e.message.includes("Corrupted zip")) { // mammoth.js error for bad docx
        errorMessage = "The DOCX file appears to be corrupted.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
