import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.order.deleteMany();
  await prisma.bulkDiscountRule.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.store.deleteMany();

  // Create store settings
  const store = await prisma.store.create({
    data: {
      name: "LeaderSon Beats",
      bio: "Premium trap, drill, and hiphop beats crafted for independent artists. High-quality production with flexible licensing.",
      profileImageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=200&h=200&fit=crop",
      twitterUrl: "https://twitter.com/leadersonbeats",
      instagramUrl: "https://instagram.com/leadersonbeats",
      tiktokUrl: "https://tiktok.com/@leadersonbeats",
      discordUrl: "https://discord.gg/leadersonbeats",
      featuredBeatIds: [],
    },
  });
  console.log("✓ Store created:", store.name);

  // Create beats
  const beats = await Promise.all([
    prisma.beat.create({
      data: {
        title: "Midnight Trap",
        bpm: 140,
        key: "C minor",
        genre: "Trap",
        tags: ["aggressive", "dark", "trap", "hip-hop"],
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        wavUrl: "https://example.com/wavs/midnight-trap.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 29.99,
        nonExclusiveCap: 10,
        exclusiveEnabled: true,
        exclusivePrice: 199.99,
        exclusiveSold: false,
        published: true,
      },
    }),
    prisma.beat.create({
      data: {
        title: "Drill Vibes",
        bpm: 170,
        key: "A minor",
        genre: "Drill",
        tags: ["drill", "hard", "aggressive", "modern"],
        coverUrl: "https://images.unsplash.com/photo-1514603452863-6f3031224c94?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        wavUrl: "https://example.com/wavs/drill-vibes.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 39.99,
        nonExclusiveCap: 5,
        exclusiveEnabled: true,
        exclusivePrice: 249.99,
        exclusiveSold: true,
        published: true,
      },
    }),
    prisma.beat.create({
      data: {
        title: "Chill Lo-Fi",
        bpm: 85,
        key: "G major",
        genre: "Lo-Fi",
        tags: ["chill", "lofi", "study", "relaxing"],
        coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        wavUrl: "https://example.com/wavs/chill-lofi.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 19.99,
        nonExclusiveCap: 15,
        exclusiveEnabled: true,
        exclusivePrice: 149.99,
        exclusiveSold: false,
        published: true,
      },
    }),
    prisma.beat.create({
      data: {
        title: "Boom Bap Classic",
        bpm: 95,
        key: "D minor",
        genre: "Hip-Hop",
        tags: ["boom-bap", "classic", "hip-hop", "boom-bap"],
        coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        wavUrl: "https://example.com/wavs/boom-bap.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 24.99,
        nonExclusiveCap: 8,
        exclusiveEnabled: true,
        exclusivePrice: 179.99,
        exclusiveSold: false,
        published: true,
      },
    }),
    prisma.beat.create({
      data: {
        title: "Ambient Wave",
        bpm: 72,
        key: "E minor",
        genre: "Ambient",
        tags: ["ambient", "atmospheric", "experimental", "cinematic"],
        coverUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        wavUrl: "https://example.com/wavs/ambient-wave.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 34.99,
        nonExclusiveCap: 3,
        exclusiveEnabled: true,
        exclusivePrice: 219.99,
        exclusiveSold: false,
        published: true,
      },
    }),
    prisma.beat.create({
      data: {
        title: "Trap Soul",
        bpm: 155,
        key: "F# minor",
        genre: "Trap",
        tags: ["trap-soul", "rnb", "emotional", "trap"],
        coverUrl: "https://images.unsplash.com/photo-1504787318-c2d6a7f53e98?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        wavUrl: "https://example.com/wavs/trap-soul.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 29.99,
        nonExclusiveCap: 6,
        exclusiveEnabled: true,
        exclusivePrice: 199.99,
        exclusiveSold: false,
        published: true,
      },
    }),
    prisma.beat.create({
      data: {
        title: "Future Bass",
        bpm: 128,
        key: "B major",
        genre: "Electronic",
        tags: ["future-bass", "electronic", "dance", "modern"],
        coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52aaf081?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        wavUrl: "https://example.com/wavs/future-bass.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 44.99,
        nonExclusiveCap: 2,
        exclusiveEnabled: true,
        exclusivePrice: 279.99,
        exclusiveSold: false,
        published: true,
      },
    }),
    prisma.beat.create({
      data: {
        title: "Melody Trap",
        bpm: 145,
        key: "G minor",
        genre: "Trap",
        tags: ["melodic", "trap", "smooth", "vibes"],
        coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=400&fit=crop",
        mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        wavUrl: "https://example.com/wavs/melody-trap.wav",
        nonExclusiveEnabled: true,
        nonExclusivePrice: 27.99,
        nonExclusiveCap: 12,
        exclusiveEnabled: true,
        exclusivePrice: 189.99,
        exclusiveSold: false,
        published: true,
      },
    }),
  ]);
  console.log(`✓ Created ${beats.length} beats`);

  // Update featured beats
  await prisma.store.update({
    where: { id: store.id },
    data: {
      featuredBeatIds: beats.slice(0, 3).map((b) => b.id),
    },
  });

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: "artist1@example.com",
        name: "Alex Producer",
        clerkId: null,
      },
    }),
    prisma.customer.create({
      data: {
        email: "artist2@example.com",
        name: "Jordan Beats",
        clerkId: null,
      },
    }),
    prisma.customer.create({
      data: {
        email: "artist3@example.com",
        name: "Casey Music",
        clerkId: null,
      },
    }),
    prisma.customer.create({
      data: {
        email: "artist4@example.com",
        name: "Morgan Studios",
        clerkId: null,
      },
    }),
    prisma.customer.create({
      data: {
        email: "artist5@example.com",
        name: "Taylor Records",
        clerkId: null,
      },
    }),
  ]);
  console.log(`✓ Created ${customers.length} customers`);

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        reference: "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        beatId: beats[0].id,
        customerId: customers[0].id,
        licenseType: "NON_EXCLUSIVE",
        amountUsd: 29.99,
        paystackReference: "PSAK-" + Date.now() + "-1",
        linkExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        reference: "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        beatId: beats[1].id,
        customerId: customers[1].id,
        licenseType: "EXCLUSIVE",
        amountUsd: 249.99,
        paystackReference: "PSAK-" + Date.now() + "-2",
        linkExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        reference: "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        beatId: beats[2].id,
        customerId: customers[2].id,
        licenseType: "NON_EXCLUSIVE",
        amountUsd: 19.99,
        paystackReference: "PSAK-" + Date.now() + "-3",
        linkExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        reference: "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        beatId: beats[3].id,
        customerId: customers[3].id,
        licenseType: "NON_EXCLUSIVE",
        amountUsd: 24.99,
        paystackReference: "PSAK-" + Date.now() + "-4",
        linkExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order.create({
      data: {
        reference: "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        beatId: beats[4].id,
        customerId: customers[4].id,
        licenseType: "NON_EXCLUSIVE",
        amountUsd: 34.99,
        paystackReference: "PSAK-" + Date.now() + "-5",
        linkExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  console.log(`✓ Created ${orders.length} orders`);

  // Create discount codes
  const discountCodes = await Promise.all([
    prisma.discountCode.create({
      data: {
        code: "WELCOME20",
        type: "PERCENTAGE",
        value: 20,
        usageCount: 0,
        usageLimit: 50,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        active: true,
      },
    }),
    prisma.discountCode.create({
      data: {
        code: "SUMMER15",
        type: "PERCENTAGE",
        value: 15,
        usageCount: 0,
        usageLimit: 100,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        active: true,
      },
    }),
    prisma.discountCode.create({
      data: {
        code: "FLATFIVE",
        type: "FIXED",
        value: 5,
        usageCount: 0,
        usageLimit: null,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        active: true,
      },
    }),
    prisma.discountCode.create({
      data: {
        code: "OLDCODE",
        type: "PERCENTAGE",
        value: 10,
        usageCount: 23,
        usageLimit: null,
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        active: false,
      },
    }),
  ]);
  console.log(`✓ Created ${discountCodes.length} discount codes`);

  // Create bulk discount rules
  const bulkDiscounts = await Promise.all([
    prisma.bulkDiscountRule.create({
      data: {
        minQuantity: 5,
        discountPercent: 10,
        stackable: true,
        active: true,
      },
    }),
    prisma.bulkDiscountRule.create({
      data: {
        minQuantity: 10,
        discountPercent: 20,
        stackable: true,
        active: true,
      },
    }),
    prisma.bulkDiscountRule.create({
      data: {
        minQuantity: 20,
        discountPercent: 35,
        stackable: false,
        active: true,
      },
    }),
  ]);
  console.log(`✓ Created ${bulkDiscounts.length} bulk discount rules`);

  console.log("\n✅ Database seed completed successfully!");
  console.log(`
📊 Summary:
  - Beats: ${beats.length}
  - Customers: ${customers.length}
  - Orders: ${orders.length}
  - Discount Codes: ${discountCodes.length}
  - Bulk Discounts: ${bulkDiscounts.length}
  - Store: 1
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
