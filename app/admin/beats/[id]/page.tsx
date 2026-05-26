import React from "react";
import prisma from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BeatEditForm from "./BeatEditForm";
import { Breadcrumb } from "@/components/Breadcrumb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBeatPage({ params }: PageProps) {
  const { id } = await params;

  // Authorization is handled by layout middleware


  const beat = await prisma.beat.findUnique({
    where: { id },
  });

  if (!beat) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Beats", href: "/admin/beats" },
        { label: beat.title },
      ]} />
      <Link
        href="/admin/beats"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Beats
      </Link>

      <div>
        <h1 className="font-syne text-3xl font-bold text-text-primary">Edit Beat</h1>
        <p className="font-mono text-sm text-text-muted mt-2">{beat.title}</p>
      </div>

      <BeatEditForm beat={beat} />
    </div>
  );
}
