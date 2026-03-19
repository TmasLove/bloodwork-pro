import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { extractTextFromFile, getFileType, sanitizeFileName } from "@/lib/file-processing";
import { analyzeBloodWork } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "PATIENT") {
      return NextResponse.json({ error: "Only patients can upload blood work" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/tiff",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or image file." },
        { status: 400 }
      );
    }

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const filePath = path.join("uploads", safeFileName);
    await writeFile(filePath, buffer);

    const fileType = getFileType(file.name);

    // Create blood work record
    const bloodWork = await prisma.bloodWork.create({
      data: {
        userId: session.id,
        fileName: file.name,
        filePath,
        fileType,
        status: "PROCESSING",
      },
    });

    // Extract text and analyze (async - we'll do it inline for simplicity)
    try {
      const extractedText = await extractTextFromFile(filePath, fileType);

      await prisma.bloodWork.update({
        where: { id: bloodWork.id },
        data: { extractedText, status: "ANALYZED" },
      });

      // Generate protocol via LLM
      const { protocol, summary } = await analyzeBloodWork(extractedText);

      await prisma.protocol.create({
        data: {
          bloodWorkId: bloodWork.id,
          patientId: session.id,
          content: protocol,
          summary,
          status: "PENDING",
        },
      });

      // Notify all doctors that a new protocol needs review
      const doctors = await prisma.user.findMany({ where: { role: "DOCTOR" } });
      await prisma.notification.createMany({
        data: doctors.map((doc) => ({
          userId: doc.id,
          message: `New blood work protocol from ${session.name} requires your review.`,
          link: `/dashboard/doctor`,
        })),
      });

      return NextResponse.json({
        success: true,
        bloodWorkId: bloodWork.id,
        message: "Blood work uploaded and analyzed. Awaiting doctor review.",
      });
    } catch (analysisError: unknown) {
      console.error("Analysis error:", analysisError);
      await prisma.bloodWork.update({
        where: { id: bloodWork.id },
        data: { status: "ERROR" },
      });
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Failed to process blood work. Please try again.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
