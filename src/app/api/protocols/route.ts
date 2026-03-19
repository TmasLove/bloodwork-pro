import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "DOCTOR") {
      // Doctors see all pending protocols + their reviewed ones
      const protocols = await prisma.protocol.findMany({
        include: {
          patient: { select: { id: true, name: true, email: true } },
          bloodWork: { select: { id: true, fileName: true, fileType: true, createdAt: true } },
          review: {
            include: {
              doctor: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ protocols });
    } else {
      // Patients see only their own protocols
      const protocols = await prisma.protocol.findMany({
        where: { patientId: session.id },
        include: {
          bloodWork: { select: { id: true, fileName: true, fileType: true, createdAt: true } },
          review: {
            include: {
              doctor: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ protocols });
    }
  } catch (error) {
    console.error("Protocols fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
