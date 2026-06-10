"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

interface BlogPost {
  title: string;
  slug: string;
  htmlContent: string;
  excerpt: string;
  createdAt: string;
  authorId?: {
    name: string;
  };
}

export default function DownloadPDFButton({ post }: { post: BlogPost }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    // 1. Add Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(post.title, 15, 20);

    // 2. Add Metadata (Author & Date)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const authorName = post.authorId?.name || "Unknown Author";
    doc.text(`By: ${authorName} | Published: ${dateStr}`, 15, 30);

    // 3. Add Content
    doc.setFontSize(12);
    doc.setTextColor(0);
    const splitContent = doc.splitTextToSize(post.htmlContent, 180);
    doc.text(splitContent, 15, 45);

    // 4. Save PDF
    doc.save(`${post.slug}.pdf`);
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="flex items-center gap-2 cursor-pointer h-9 px-4 text-sm font-medium"
    >
      <Download className="h-4 w-4" />
      <span>Download PDF</span>
    </Button>
  );
}
