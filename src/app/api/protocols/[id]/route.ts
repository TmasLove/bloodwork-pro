import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const protocol = await prisma.protocol.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        bloodWork: true,
        review: {
          include: {
            doctor: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!protocol) {
      return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
    }

    // Patients can only see their own protocols
    if (session.role === "PATIENT" && protocol.patientId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ protocol });
  } catch (error) {
    console.error("Protocol fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
