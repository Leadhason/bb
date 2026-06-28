import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { initializePaystackTransaction } from "@/lib/paystack";
import { resend } from "@/lib/resend";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      beatId,
      licenseType,
      email,
      name,
      discountCode,
      createAccount,
      password,
      isCart,
      cartItems,
    } = body;

    // 1. Basic validation
    if (!email || !name) {
      return NextResponse.json({ error: "Email and Name are required." }, { status: 400 });
    }

    if (!isCart && (!beatId || !licenseType)) {
      return NextResponse.json({ error: "Beat ID and License Type are required." }, { status: 400 });
    }

    if (isCart && (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0)) {
      return NextResponse.json({ error: "Cart items are required for cart checkout." }, { status: 400 });
    }

    // 2. Fetch beats and calculate base price
    let basePrice = 0;
    const itemsToPurchase: { beatId: string; licenseType: "NON_EXCLUSIVE" | "EXCLUSIVE"; price: number; title: string }[] = [];

    const checkoutItems = isCart
      ? cartItems.map((item: any) => ({
          beatId: item.beat.id,
          licenseType: item.licenseType.replace("-", "_").toUpperCase() as "NON_EXCLUSIVE" | "EXCLUSIVE",
        }))
      : [{ beatId, licenseType: licenseType.replace("-", "_").toUpperCase() as "NON_EXCLUSIVE" | "EXCLUSIVE" }];

    for (const item of checkoutItems) {
      const beat = await prisma.beat.findUnique({
        where: { id: item.beatId },
      });

      if (!beat) {
        return NextResponse.json({ error: `Beat not found.` }, { status: 404 });
      }

      if (!beat.published && item.licenseType === "NON_EXCLUSIVE") {
        return NextResponse.json({ error: `Beat "${beat.title}" is not available.` }, { status: 400 });
      }

      // Check licensing rules
      if (item.licenseType === "EXCLUSIVE") {
        if (!beat.exclusiveEnabled || beat.exclusiveSold) {
          return NextResponse.json({ error: `Exclusive license for "${beat.title}" is not available.` }, { status: 400 });
        }
      } else {
        if (!beat.nonExclusiveEnabled) {
          return NextResponse.json({ error: `Non-exclusive license for "${beat.title}" is not available.` }, { status: 400 });
        }
        // Check cap
        if (beat.nonExclusiveCap !== null) {
          const soldCount = await prisma.order.count({
            where: { beatId: beat.id, licenseType: "NON_EXCLUSIVE" },
          });
          if (soldCount >= beat.nonExclusiveCap) {
            return NextResponse.json({ error: `Non-exclusive sales cap reached for "${beat.title}".` }, { status: 400 });
          }
        }
      }

      const price = item.licenseType === "EXCLUSIVE" ? Number(beat.exclusivePrice) : Number(beat.nonExclusivePrice);
      itemsToPurchase.push({
        beatId: beat.id,
        licenseType: item.licenseType,
        price,
        title: beat.title,
      });
      basePrice += price;
    }

    // 3. Check and apply discount code
    let discountPercent = 0;
    let discountAmount = 0;
    let discount = null;

    if (discountCode) {
      const cleanCode = discountCode.trim().toUpperCase();
      discount = await prisma.discountCode.findUnique({
        where: { code: cleanCode },
      });

      if (discount && discount.active) {
        const expired = discount.expiresAt && new Date(discount.expiresAt) < new Date();
        const limitReached = discount.usageLimit !== null && discount.usageCount >= discount.usageLimit;

        if (!expired && !limitReached) {
          if (discount.type === "PERCENTAGE") {
            discountPercent = Number(discount.value);
            discountAmount = (basePrice * discountPercent) / 100;
          } else {
            discountAmount = Number(discount.value);
          }
        }
      }
    }

    // 4. Check and apply bulk discount rules
    let bulkPercent = 0;
    let bulkDiscountAmount = 0;
    const numBeats = itemsToPurchase.length;

    const activeBulkRule = await prisma.bulkDiscountRule.findFirst({
      where: {
        active: true,
        minQuantity: { lte: numBeats },
      },
      orderBy: { minQuantity: "desc" },
    });

    if (activeBulkRule) {
      bulkPercent = Number(activeBulkRule.discountPercent);
      
      if (discount && !activeBulkRule.stackable) {
        // Mutually exclusive: pick the higher discount
        const codeDiscount = discountAmount;
        const bulkDiscount = (basePrice * bulkPercent) / 100;
        if (bulkDiscount > codeDiscount) {
          bulkDiscountAmount = bulkDiscount;
          discountAmount = 0; // Disable coupon code discount
        } else {
          bulkDiscountAmount = 0;
        }
      } else {
        // They stack
        bulkDiscountAmount = (basePrice * bulkPercent) / 100;
      }
    }

    const finalPrice = Math.max(0, basePrice - discountAmount - bulkDiscountAmount);

    // 5. Build transaction metadata for Paystack
    const metadata = {
      isCart,
      email,
      name,
      createAccount,
      password: createAccount ? password : null,
      discountCode: discountCode || null,
      items: itemsToPurchase.map((item) => ({
        beatId: item.beatId,
        licenseType: item.licenseType,
        price: item.price,
      })),
    };

    // 6. Handle free beat checkout directly (giving 100% discount or giveaway)
    if (finalPrice === 0) {
      // Find or create customer
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

      // Check if user account needs to be created
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
          await prisma.customer.update({
            where: { id: customer.id },
            data: { clerkId: clerkUserId },
          });
        } catch (e) {
          console.error("Clerk user creation error (skipping account creation):", e);
        }
      }

      // Generate unique reference (ORD-XXXXXX)
      const orderRef = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const paystackRef = "FREE-" + Date.now();

      // Create orders for each item
      const createdOrders = [];
      for (const item of itemsToPurchase) {
        const order = await prisma.order.create({
          data: {
            reference: "ORD-" + Math.floor(100000 + Math.random() * 900000),
            customerId: customer.id,
            beatId: item.beatId,
            licenseType: item.licenseType,
            amountUsd: 0,
            paystackReference: paystackRef + "-" + item.beatId,
            linkExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
            downloadAttempts: 0,
          },
          include: {
            beat: true,
          },
        });

        createdOrders.push(order);

        // Update beat if exclusive
        if (item.licenseType === "EXCLUSIVE") {
          await prisma.beat.update({
            where: { id: item.beatId },
            data: { exclusiveSold: true, published: false },
          });
        }
      }

      // Increment coupon usage count
      if (discount) {
        await prisma.discountCode.update({
          where: { id: discount.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Send confirmation emails via Resend
      if (resend) {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${req.headers.get("host")}`;
          
          for (const order of createdOrders) {
            const downloadUrl = `${appUrl}/api/orders/${order.reference}/download`;
            const licenseText = order.licenseType === "EXCLUSIVE" ? "Exclusive" : "Non-Exclusive";

            // Email 1: To Customer
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
                        <span style="color:#888888;">License:</span>
                        <span style="margin-left:auto;">${licenseText}</span>
                      </div>
                      <div style="display:flex;justify-content:between;">
                        <span style="color:#888888;">Amount Paid:</span>
                        <span style="margin-left:auto;">$0.00 (Giveaway)</span>
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

          // Email 3: To Producer
          const producerClerkId = process.env.NEXT_PUBLIC_PRODUCER_CLERK_ID || process.env.PRODUCER_CLERK_ID;
          let producerEmail = "producer@yourbeats.com";
          if (producerClerkId) {
            try {
              const client = await clerkClient();
              const prodUser = await client.users.getUser(producerClerkId);
              producerEmail = prodUser.primaryEmailAddress?.emailAddress || producerEmail;
            } catch (e) {
              console.error("Failed to fetch producer email:", e);
            }
          }

          const beatNames = itemsToPurchase.map((item) => item.title).join(", ");
          await resend.emails.send({
            from: "Beat Store <noreply@yourbeats.com>",
            to: producerEmail,
            subject: `New sale — ${beatNames} · Giveaway · $0`,
            html: `
              <div style="background:#0a0a0a;padding:40px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                <div style="max-width:480px;margin:0 auto;background:#111111;border-radius:8px;padding:32px;border:1px solid #1e1e1e;">
                  <p style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.12em;margin:0 0 28px;">PRODUCER ALERT</p>
                  <h2 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 16px;">You made a sale (Giveaway).</h2>
                  <p style="font-size:14px;color:#888888;line-height:1.65;margin:0 0 24px;">
                    A free checkout was completed for <strong>${beatNames}</strong>.
                  </p>
                  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:16px;margin:0 0 24px;color:#ffffff;font-size:13px;">
                    <div style="display:flex;justify-content:between;margin-bottom:8px;">
                      <span style="color:#888888;">Customer:</span>
                      <span style="margin-left:auto;">${name} (${email})</span>
                    </div>
                    <div style="display:flex;justify-content:between;margin-bottom:8px;">
                      <span style="color:#888888;">Items:</span>
                      <span style="margin-left:auto;">${beatNames}</span>
                    </div>
                    <div style="display:flex;justify-content:between;">
                      <span style="color:#888888;">Price settled:</span>
                      <span style="margin-left:auto;">$0.00 (Giveaway)</span>
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
          console.error("Resend email dispatch error on free checkout:", mailError);
        }
      }

      // Return success response to frontend directly bypassing Paystack
      return NextResponse.json({
        success: true,
        free: true,
        reference: createdOrders[0].reference, // Return first order's reference for successful screen redirection
      });
    }

    // 7. Initialize standard paid checkout on Paystack
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    
    // Redirect customer to /order/pending?reference=... which verifies status and redirects to final page
    const callbackUrl = `${appUrl}/order/callback`;

    const USD_TO_GHS_RATE = Number(process.env.USD_TO_GHS_RATE || "15.0");
    const finalPriceGhs = finalPrice * USD_TO_GHS_RATE;

    const { authorization_url, reference } = await initializePaystackTransaction(
      email,
      finalPriceGhs,
      metadata,
      callbackUrl,
      "GHS"
    );

    return NextResponse.json({
      success: true,
      free: false,
      authorization_url,
      reference,
    });
  } catch (error: any) {
    console.error("Error initializing checkout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize checkout process." },
      { status: 500 }
    );
  }
}
