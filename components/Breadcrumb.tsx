"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-text-secondary font-syne mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3 h-3 text-text-muted" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
