import React from "react";
import prisma from "../../../lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { PublishToggle } from "./PublishToggle";
import { DeleteBeatButton } from "./DeleteBeatButton";
import { DeleteUnpublishedBeatsButton } from "./DeleteUnpublishedBeatsButton";

export default async function BeatsPage() {
  // Authorization is handled by layout middleware
  
  const beats = await prisma.beat.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unpublishedCount = beats.filter((beat) => !beat.published).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne text-3xl font-bold text-text-primary">Beats Management</h1>
          <p className="font-mono text-sm text-text-muted mt-2">Manage your beat catalogue</p>
        </div>
        <div className="flex items-center gap-3">
          <DeleteUnpublishedBeatsButton count={unpublishedCount} />
          <Link
            href="/admin/beats/new"
            className="btn-primary h-10 px-5 text-sm uppercase font-syne font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Beat
          </Link>
        </div>
      </div>

      {beats.length === 0 ? (
        <div className="bg-bg-surface border border-border-default rounded-xl p-12 text-center">
          <p className="text-text-muted font-syne mb-4">No beats yet</p>
          <Link
            href="/admin/beats/new"
            className="btn-primary h-10 px-5 text-sm uppercase font-syne font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Beat
          </Link>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated">
                  <th className="text-left px-6 py-4 font-syne font-semibold text-xs uppercase tracking-wide text-text-secondary">
                    Title
                  </th>
                  <th className="text-left px-6 py-4 font-syne font-semibold text-xs uppercase tracking-wide text-text-secondary">
                    Genre
                  </th>
                  <th className="text-left px-6 py-4 font-syne font-semibold text-xs uppercase tracking-wide text-text-secondary">
                    BPM / Key
                  </th>
                  <th className="text-left px-6 py-4 font-syne font-semibold text-xs uppercase tracking-wide text-text-secondary">
                    Licensing
                  </th>
                  <th className="text-left px-6 py-4 font-syne font-semibold text-xs uppercase tracking-wide text-text-secondary">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 font-syne font-semibold text-xs uppercase tracking-wide text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {beats.map((beat) => (
                  <tr key={beat.id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-bg-elevated border border-border-strong flex-shrink-0" />
                        <div>
                          <p className="font-syne font-medium text-text-primary text-sm">{beat.title}</p>
                          <p className="font-mono text-xs text-text-muted">
                            {new Date(beat.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-syne text-sm text-text-primary">{beat.genre}</td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-text-muted">
                        <div>{beat.bpm} BPM</div>
                        <div>{beat.key}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {beat.nonExclusiveEnabled && (
                          <span className="px-2 py-1 rounded text-xs font-mono bg-badge-neutral-bg text-badge-neutral-text">
                            NE ${beat.nonExclusivePrice.toString()}
                          </span>
                        )}
                        {beat.exclusiveEnabled && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-mono ${
                              beat.exclusiveSold
                                ? "bg-badge-danger-bg text-badge-danger-text"
                                : "bg-badge-neutral-bg text-badge-neutral-text"
                            }`}
                          >
                            {beat.exclusiveSold ? "EXC SOLD" : `EXC $${beat.exclusivePrice.toString()}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono uppercase tracking-wider ${
                          beat.published
                            ? "bg-badge-success-bg text-badge-success-text"
                            : "bg-badge-warning-bg text-badge-warning-text"
                        }`}
                      >
                        {beat.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <PublishToggle beatId={beat.id} isPublished={beat.published} />
                        <Link
                          href={`/admin/beats/${beat.id}`}
                          className="btn-icon"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteBeatButton beatId={beat.id} beatTitle={beat.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
