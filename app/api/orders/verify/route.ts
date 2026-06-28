import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Reference parameter is required." }, { status: 400 });
    }

    // Find the first order matching this Paystack transaction reference prefix
    // (We stored paystackReference as `reference-beatId` for cart orders)
    const order = await prisma.order.findFirst({
      where: {
        paystackReference: {
          startsWith: reference,
        },
      },
    });

    if (order) {
      return NextResponse.json({
        success: true,
        orderRef: order.reference,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Order is still processing. Please wait...",
    });
  } catch (error) {
    console.error("Error verifying order:", error);
    return NextResponse.json(
      { error: "Internal server error during order verification." },
      { status: 500 }
    );
  }
}
