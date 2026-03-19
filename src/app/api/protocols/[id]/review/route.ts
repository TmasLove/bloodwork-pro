import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized: Doctor access required" }, { status: 403 });
    }

    const { id } = await params;
    const { decision, comments } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(decision)) {
      return NextResponse.json(
        { error: "Decision must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const protocol = await prisma.protocol.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!protocol) {
      return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
    }

    if (protocol.status !== "PENDING") {
      return NextResponse.json(
        { error: "Protocol has already been reviewed" },
        { status: 400 }
      );
    }

    // Create review and update protocol status in a transaction
    await prisma.$transaction([
      prisma.doctorReview.create({
        data: {
          protocolId: id,
          doctorId: session.id,
          decision,
          comments: comments || null,
        },
      }),
      prisma.protocol.update({
        where: { id },
        data: { status: decision },
      }),
      prisma.notification.create({
        data: {
          userId: protocol.patientId,
          message:
            decision === "APPROVED"
              ? `Your blood work protocol has been approved by Dr. ${session.name}. You can now view your daily protocol.`
              : `Your blood work protocol needs revision. Dr. ${session.name} left feedback.`,
          link: `/dashboard/protocol/${id}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, decision });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
