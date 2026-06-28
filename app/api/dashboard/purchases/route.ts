import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get Clerk user details to obtain the primary email address
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "No email address found for the authenticated user." },
        { status: 400 }
      );
    }

    // 2. Query customer record by clerkId OR by email
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { clerkId: userId },
          { email: email },
        ],
      },
    });

    if (customer) {
      // Enforce Business Rule 8: Link guest orders to registered account if emails match
      if (!customer.clerkId) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { clerkId: userId },
        });
      }
    } else {
      // Create a customer profile if they registered but haven't purchased yet
      customer = await prisma.customer.create({
        data: {
          clerkId: userId,
          email: email,
          name: clerkUser.fullName || email.split("@")[0],
        },
      });
    }

    // 3. Fetch all orders associated with this customer
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        beat: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format orders for the dashboard view
    const purchasedBeats = orders.map((order) => {
      const formattedDate = new Date(order.createdAt).toISOString().split("T")[0];
      const licenseText = order.licenseType === "EXCLUSIVE" ? "Exclusive" : "Non-Exclusive";

      return {
        id: order.id,
        title: order.beat.title,
        genre: order.beat.genre,
        licenseType: licenseText,
        purchaseDate: formattedDate,
        coverColor: "from-zinc-900 to-black border-zinc-800",
        orderRef: order.reference,
        downloadAttempts: order.downloadAttempts,
        linkExpiresAt: order.linkExpiresAt,
      };
    });

    return NextResponse.json({ purchases: purchasedBeats });
  } catch (error) {
    console.error("Error retrieving dashboard purchases:", error);
    return NextResponse.json(
      { error: "Internal server error while loading purchases." },
      { status: 500 }
    );
  }
}
