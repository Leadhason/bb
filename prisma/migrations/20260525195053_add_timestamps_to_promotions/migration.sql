-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('NON_EXCLUSIVE', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "beats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "tags" TEXT[],
    "coverUrl" TEXT NOT NULL,
    "mp3Url" TEXT NOT NULL,
    "wavUrl" TEXT NOT NULL,
    "nonExclusiveEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nonExclusivePrice" DECIMAL(65,30) NOT NULL,
    "nonExclusiveCap" INTEGER,
    "exclusiveEnabled" BOOLEAN NOT NULL DEFAULT true,
    "exclusivePrice" DECIMAL(65,30) NOT NULL,
    "exclusiveSold" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "beatId" TEXT NOT NULL,
    "licenseType" "LicenseType" NOT NULL,
    "amountUsd" DECIMAL(65,30) NOT NULL,
    "paystackReference" TEXT NOT NULL,
    "downloadAttempts" INTEGER NOT NULL DEFAULT 0,
    "linkExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_discount_rules" (
    "id" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "discountPercent" DECIMAL(65,30) NOT NULL,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_discount_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_clerkId_key" ON "customers"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_reference_key" ON "orders"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "orders_paystackReference_key" ON "orders"("paystackReference");

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "discount_codes"("code");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "beats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
