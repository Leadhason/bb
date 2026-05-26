import React from "react";
import BeatUploadForm from "./BeatUploadForm";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function NewBeatPage() {
  // Authorization is handled by layout middleware
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Beats", href: "/admin/beats" },
        { label: "Upload New" },
      ]} />
      <div className="mb-8">
        <h1 className="font-syne text-2xl font-bold text-text-primary">Upload New Beat</h1>
        <p className="font-mono text-sm text-text-muted mt-2">Add a new beat to the catalogue</p>
      </div>

      <BeatUploadForm />
    </div>
  );
}