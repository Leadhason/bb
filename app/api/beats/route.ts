import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const BEATS_PER_PAGE = 12;

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    
    if (page < 0) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    const beats = await prisma.beat.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      skip: page * BEATS_PER_PAGE,
      take: BEATS_PER_PAGE + 1, // Fetch one extra to detect if there are more
    });

    // Serialize beats
    const serializedBeats = beats.slice(0, BEATS_PER_PAGE).map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      nonExclusivePrice: Number(b.nonExclusivePrice),
      exclusivePrice: Number(b.exclusivePrice),
      coverColor: "from-neutral-800 to-neutral-900",
    }));

    const hasMore = beats.length > BEATS_PER_PAGE;

    return NextResponse.json({
      beats: serializedBeats,
      hasMore,
      page,
    });
  } catch (error) {
    console.error("Error fetching beats:", error);
    return NextResponse.json(
      { error: "Failed to fetch beats" },
      { status: 500 }
    );
  }
}
