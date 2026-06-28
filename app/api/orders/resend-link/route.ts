import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email, orderRef } = await req.json();

    if (!email || !orderRef) {
      return NextResponse.json(
        { error: "Email and Order Reference are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRef = orderRef.trim().toUpperCase();

    // 1. Fetch order matching email and reference
    const order = await prisma.order.findFirst({
      where: {
        reference: cleanRef,
        customer: {
          email: cleanEmail,
        },
      },
      include: {
        customer: true,
        beat: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No matching order was found for this email and reference." },
        { status: 404 }
      );
    }

    // 2. Verify download limit
    if (order.downloadAttempts >= 3) {
      return NextResponse.json(
        {
          error:
            "This order's download limit (3 attempts) has been exhausted. Please contact support.",
        },
        { status: 403 }
      );
    }

    // 3. Reset 48-hour expiration window in database
    const newExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        linkExpiresAt: newExpiresAt,
      },
    });

    // 4. Send Email 2: Resent Download Link via Resend
    if (resend) {
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
      const downloadUrl = `${appUrl}/api/orders/${order.reference}/download`;
      const remainingAttempts = 3 - order.downloadAttempts;
      const licenseText = order.licenseType === "EXCLUSIVE" ? "Exclusive" : "Non-Exclusive";

      try {
        await resend.emails.send({
          from: "Beat Store <noreply@yourbeats.com>",
          to: cleanEmail,
          subject: `New download link — ${order.beat.title}`,
          html: `
            <div style="background:#0a0a0a;padding:40px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <div style="max-width:480px;margin:0 auto;background:#111111;border-radius:8px;padding:32px;border:1px solid #1e1e1e;">
                <p style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.12em;margin:0 0 28px;">BLINGSBEATS</p>
                <h2 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 16px;">Here's your new link.</h2>
                <p style="font-size:14px;color:#888888;line-height:1.65;margin:0 0 24px;">
                  We have regenerated the download link for <strong>${order.beat.title}</strong> (${licenseText} License).
                </p>
                <div style="margin:0 0 28px;text-align:center;">
                  <a href="${downloadUrl}" style="background:#ffffff;color:#000000;padding:12px 24px;border-radius:4px;font-weight:600;text-decoration:none;display:inline-block;font-size:14px;">
                    Download ${order.beat.title} (WAV)
                  </a>
                </div>
                <p style="font-family:'DM Mono',monospace;font-size:11px;color:#444444;margin:0 0 24px;">
                  Your previous download count carries over. You have <strong>${remainingAttempts}</strong> downloads remaining.
                </p>
                <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:16px;color:#ffffff;font-size:13px;">
                  <div style="display:flex;justify-content:between;margin-bottom:8px;">
                    <span style="color:#888888;">Order Ref:</span>
                    <span style="font-family:'DM Mono',monospace;margin-left:auto;">${order.reference}</span>
                  </div>
                  <div style="display:flex;justify-content:between;">
                    <span style="color:#888888;">License:</span>
                    <span style="margin-left:auto;">${licenseText}</span>
                  </div>
                </div>
                <div style="border-top:1px solid #1e1e1e;margin-top:28px;padding-top:20px;">
                  <p style="font-size:11px;color:#444444;margin:0;">blingsbeats.com</p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Resend email dispatch error on link recovery:", mailError);
        return NextResponse.json(
          { error: "Failed to dispatch recovery email. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resending download link:", error);
    return NextResponse.json(
      { error: "Internal server error during link recovery." },
      { status: 500 }
    );
  }
}
