import { readFile } from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";

export async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<string> {
  if (fileType === "pdf") {
    return extractFromPDF(filePath);
  } else {
    return extractFromImage(filePath);
  }
}

async function extractFromPDF(filePath: string): Promise<string> {
  const absolutePath = path.resolve(filePath);
  const buffer = await readFile(absolutePath);
  try {
    const data = await pdfParse(buffer);
    if (data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch (err) {
    console.error("PDF parse failed, raw text fallback:", err);
  }
  // Fallback: return raw buffer as UTF-8 text (catches plaintext disguised as PDF)
  const rawText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
  if (rawText.trim().length > 20) {
    return rawText;
  }
  throw new Error(
    "Could not extract text from PDF. The file may be scanned/image-based. Please upload an image (PNG/JPG) of your blood work instead."
  );
}

async function extractFromImage(filePath: string): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const absolutePath = path.resolve(filePath);
  const {
    data: { text },
  } = await Tesseract.recognize(absolutePath, "eng");
  if (!text || text.trim().length === 0) {
    throw new Error("Could not extract text from image. Please ensure the image is clear and readable.");
  }
  return text;
}

export function getFileType(fileName: string): "pdf" | "image" {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "pdf";
  return "image";
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}
