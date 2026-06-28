import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { resend } from "@/lib/resend";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const paystackSignature = req.headers.get("x-paystack-signature");
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY is not configured.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!paystackSignature) {
      return NextResponse.json({ error: "Missing Paystack signature" }, { status: 400 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(rawBody)
      .digest("hex");

    if (hash !== paystackSignature) {
      console.warn("Invalid webhook signature received.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Only process charge.success events
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const transaction = event.data;
    const { reference, amount, metadata } = transaction;

    if (!metadata || !metadata.email || !metadata.name || !metadata.items) {
      console.warn("Paystack transaction metadata is incomplete. Reference:", reference);
      return NextResponse.json({ error: "Incomplete metadata" }, { status: 400 });
    }

    const { email, name, createAccount, password, discountCode, items } = metadata;

    // 1. Find or create the Customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          name,
        },
      });
    }

    // 2. Create Clerk Account if requested and not already registered
    let clerkUserId = customer.clerkId;
    if (createAccount && password && !clerkUserId) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.createUser({
          emailAddress: [email],
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" ") || undefined,
          password: password,
        });
        clerkUserId = clerkUser.id;
        
        // Link customer to Clerk ID
        await prisma.customer.update({
          where: { id: customer.id },
          data: { clerkId: clerkUserId },
        });
      } catch (clerkError) {
        console.error("Failed to create Clerk user account during webhook:", clerkError);
      }
    }

    // 3. Create database Orders and update Beat statuses
    const createdOrders = [];
    
    for (const item of items) {
      // Check if this order was already created (webhook idempotency)
      const existingOrder = await prisma.order.findUnique({
        where: { paystackReference: `${reference}-${item.beatId}` },
      });

      if (existingOrder) {
        console.log(`Order already processed for reference ${reference} and beat ${item.beatId}.`);
        continue;
      }

      const licenseTypeEnum = item.licenseType.replace("-", "_").toUpperCase() as "NON_EXCLUSIVE" | "EXCLUSIVE";
      const orderRef = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const amountUsd = Number(item.price);

      const order = await prisma.order.create({
        data: {
          reference: orderRef,
          customerId: customer.id,
          beatId: item.beatId,
          licenseType: licenseTypeEnum,
          amountUsd: amountUsd,
          paystackReference: `${reference}-${item.beatId}`,
          linkExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours expiration
          downloadAttempts: 0,
        },
        include: {
          beat: true,
        },
      });

      createdOrders.push(order);

      // Handle business rules for Exclusives
      if (licenseTypeEnum === "EXCLUSIVE") {
        await prisma.beat.update({
          where: { id: item.beatId },
          data: {
            exclusiveSold: true,
            published: false,
          },
        });
      }
    }

    // 4. Update coupon code usage count if a code was used
    if (discountCode) {
      try {
        await prisma.discountCode.update({
          where: { code: discountCode.toUpperCase() },
          data: {
            usageCount: { increment: 1 },
          },
        });
      } catch (err) {
        console.error("Failed to increment discount code usage:", err);
      }
    }

    // 5. Send Email Notifications via Resend
    if (resend && createdOrders.length > 0) {
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

      try {
        for (const order of createdOrders) {
          const downloadUrl = `${appUrl}/api/orders/${order.reference}/download`;
          const licenseText = order.licenseType === "EXCLUSIVE" ? "Exclusive" : "Non-Exclusive";
          const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          // Email 1: Purchase Confirmation to Customer
          await resend.emails.send({
            from: "Beat Store <noreply@yourbeats.com>",
            to: email,
            subject: `Your beat is ready — ${order.beat.title}`,
            html: `
              <div style="background:#0a0a0a;padding:40px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                <div style="max-width:480px;margin:0 auto;background:#111111;border-radius:8px;padding:32px;border:1px solid #1e1e1e;">
                  <p style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.12em;margin:0 0 28px;">BLINGSBEATS</p>
                  <h2 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 16px;">You're all set.</h2>
                  <p style="font-size:14px;color:#888888;line-height:1.65;margin:0 0 24px;">
                    Here's your download link for <strong>${order.beat.title}</strong> (${licenseText} License).
                  </p>
                  <div style="margin:0 0 28px;text-align:center;">
                    <a href="${downloadUrl}" style="background:#ffffff;color:#000000;padding:12px 24px;border-radius:4px;font-weight:600;text-decoration:none;display:inline-block;font-size:14px;">
                      Download ${order.beat.title} (WAV)
                    </a>
                  </div>
                  <p style="font-family:'DM Mono',monospace;font-size:11px;color:#444444;margin:0 0 24px;">
                    Link expires in 48 hours · 3 downloads available
                  </p>
                  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:16px;margin:0 0 24px;color:#ffffff;font-size:13px;">
                    <div style="display:flex;justify-content:between;margin-bottom:8px;">
                      <span style="color:#888888;">Order Ref:</span>
                      <span style="font-family:'DM Mono',monospace;margin-left:auto;">${order.reference}</span>
                    </div>
                    <div style="display:flex;justify-content:between;margin-bottom:8px;">
                      <span style="color:#888888;">Beat:</span>
                      <span style="margin-left:auto;">${order.beat.title}</span>
                    </div>
                    <div style="display:flex;justify-content:between;margin-bottom:8px;">
                      <span style="color:#888888;">License:</span>
                      <span style="margin-left:auto;">${licenseText}</span>
                    </div>
                    <div style="display:flex;justify-content:between;margin-bottom:8px;">
                      <span style="color:#888888;">Amount Paid:</span>
                      <span style="margin-left:auto;">$${Number(order.amountUsd).toFixed(2)} USD</span>
                    </div>
                    <div style="display:flex;justify-content:between;">
                      <span style="color:#888888;">Date:</span>
                      <span style="margin-left:auto;">${formattedDate}</span>
                    </div>
                  </div>
                  <p style="font-size:12px;color:#666666;line-height:1.65;margin:0 0 12px;">
                    Save your order reference — you'll need it to request a new link if yours expires.
                  </p>
                  ${
                    order.licenseType === "NON_EXCLUSIVE"
                      ? '<p style="font-size:12px;color:#666666;line-height:1.65;margin:0;">You hold a non-exclusive license. Credit the producer as: <strong>Prod. BlingsBeats</strong></p>'
                      : ""
                  }
                  <div style="border-top:1px solid #1e1e1e;margin-top:28px;padding-top:20px;">
                    <p style="font-size:11px;color:#444444;margin:0;">blingsbeats.com</p>
                  </div>
                </div>
              </div>
            `,
          });
        }

        // Email 3: New Sale Alert to Producer
        const producerClerkId = process.env.NEXT_PUBLIC_PRODUCER_CLERK_ID || process.env.PRODUCER_CLERK_ID;
        let producerEmail = "producer@yourbeats.com";
        if (producerClerkId) {
          try {
            const client = await clerkClient();
            const prodUser = await client.users.getUser(producerClerkId);
            producerEmail = prodUser.primaryEmailAddress?.emailAddress || producerEmail;
          } catch (e) {
            console.error("Failed to fetch producer email for sale notification:", e);
          }
        }

        const USD_TO_GHS_RATE = Number(process.env.USD_TO_GHS_RATE || "15.0");
        const totalAmountGhs = amount / 100;
        const totalAmountUsd = totalAmountGhs / USD_TO_GHS_RATE;
        const beatNames = createdOrders.map((o) => o.beat.title).join(", ");
        const licenseTypes = createdOrders.map((o) => o.licenseType).join(", ");

        await resend.emails.send({
          from: "Beat Store <noreply@yourbeats.com>",
          to: producerEmail,
          subject: `New sale — ${beatNames} · ${licenseTypes} · GHS ${totalAmountGhs.toFixed(2)}`,
          html: `
            <div style="background:#0a0a0a;padding:40px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <div style="max-width:480px;margin:0 auto;background:#111111;border-radius:8px;padding:32px;border:1px solid #1e1e1e;">
                <p style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.12em;margin:0 0 28px;">PRODUCER ALERT</p>
                <h2 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 16px;">You made a sale!</h2>
                <p style="font-size:14px;color:#888888;line-height:1.65;margin:0 0 24px;">
                  A successful payment has been processed for <strong>${beatNames}</strong>.
                </p>
                <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:16px;margin:0 0 24px;color:#ffffff;font-size:13px;">
                  <div style="display:flex;justify-content:between;margin-bottom:8px;">
                    <span style="color:#888888;">Customer:</span>
                    <span style="margin-left:auto;">${name} (${email})</span>
                  </div>
                  <div style="display:flex;justify-content:between;margin-bottom:8px;">
                    <span style="color:#888888;">Beats:</span>
                    <span style="margin-left:auto;">${beatNames}</span>
                  </div>
                  <div style="display:flex;justify-content:between;margin-bottom:8px;">
                    <span style="color:#888888;">Licenses:</span>
                    <span style="margin-left:auto;">${licenseTypes}</span>
                  </div>
                  <div style="display:flex;justify-content:between;margin-bottom:8px;">
                    <span style="color:#888888;">Paystack Ref:</span>
                    <span style="font-family:'DM Mono',monospace;margin-left:auto;">${reference}</span>
                  </div>
                  <div style="display:flex;justify-content:between;">
                    <span style="color:#888888;">Price settled:</span>
                    <span style="margin-left:auto;">GHS ${totalAmountGhs.toFixed(2)} (~$${totalAmountUsd.toFixed(2)} USD)</span>
                  </div>
                </div>
                <div style="text-align:center;margin-top:24px;">
                  <a href="${appUrl}/admin/orders" style="background:#ffffff;color:#000000;padding:10px 20px;border-radius:4px;font-weight:600;text-decoration:none;display:inline-block;font-size:13px;">
                    View Orders in Dashboard
                  </a>
                </div>
                <div style="border-top:1px solid #1e1e1e;margin-top:28px;padding-top:20px;">
                  <p style="font-size:11px;color:#444444;margin:0;">blingsbeats.com</p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Resend email dispatch error in webhook:", mailError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
