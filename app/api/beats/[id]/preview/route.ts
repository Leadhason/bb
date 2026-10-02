import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json({ error: "Beat ID is required." }, { status: 400 });
    }

    // Increment real preview count in database
    await prisma.$executeRawUnsafe(
      `UPDATE beats SET "previewCount" = "previewCount" + 1 WHERE id = $1;`,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging beat preview play:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
