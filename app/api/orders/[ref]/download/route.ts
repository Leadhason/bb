import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ ref: string }> }
) {
  const params = await props.params;
  try {
    const { ref } = params;

    if (!ref) {
      return NextResponse.json({ error: "Order reference is required." }, { status: 400 });
    }

    // 1. Fetch the order
    const order = await prisma.order.findUnique({
      where: { reference: ref },
      include: {
        beat: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 2. Validate link expiry (48 hours)
    const isExpired = new Date(order.linkExpiresAt) < new Date();
    if (isExpired) {
      return NextResponse.json(
        { error: "Download link has expired. The link is valid for 48 hours only." },
        { status: 410 }
      );
    }

    // 3. Validate download attempts (maximum 3)
    if (order.downloadAttempts >= 3) {
      return NextResponse.json(
        { error: "Download limit reached. You have already downloaded this file 3 times." },
        { status: 403 }
      );
    }

    // 4. Extract file key from beat.wavUrl
    let fileKey = order.beat.wavUrl;
    if (fileKey.includes("/clean-wavs/")) {
      fileKey = fileKey.split("/clean-wavs/").pop() || fileKey;
    } else if (fileKey.includes("/")) {
      fileKey = fileKey.split("/").pop() || fileKey;
    }

    // Remove query params if any in URL
    if (fileKey.includes("?")) {
      fileKey = fileKey.split("?")[0];
    }

    // 5. Generate Private Signed URL from Supabase Storage (5 min expiry)
    if (!supabaseAdmin) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured on the server.");
      return NextResponse.json(
        { error: "Internal server error: File storage client not initialized." },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from("clean-wavs")
      .createSignedUrl(fileKey, 300, {
        download: `${order.beat.title.replace(/[^a-zA-Z0-9.-]/g, "_")}.wav`,
      }); // 5 minutes signed link with forced attachment download

    if (error || !data?.signedUrl) {
      console.error("Supabase Storage signed URL generation failed:", error);
      return NextResponse.json(
        { error: "Failed to locate the master WAV file in storage." },
        { status: 500 }
      );
    }

    // 6. Increment download attempts count in database
    await prisma.order.update({
      where: { id: order.id },
      data: {
        downloadAttempts: { increment: 1 },
      },
    });

    // 7. Redirect user directly to the signed URL to trigger download
    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error retrieving download link:", error);
    return NextResponse.json(
      { error: "Internal server error during download process." },
      { status: 500 }
    );
  }
}
