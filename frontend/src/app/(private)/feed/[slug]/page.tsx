import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Calendar, User, Tag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPostBySlug } from "@/src/api/services/post.service";
import DownloadPDFButton from "@/src/components/DownloadPDFButton";

interface PostAuthor {
  name: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  htmlContent: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  createdAt: string;
  authorId?: PostAuthor;
}

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Dynamic Meta Injection for search engines and preview cards
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
 

  try {
    const post: BlogPost = await getPostBySlug(slug);

    return {
      title: `${post.title} | Eng.Journal`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
    };
  } catch (error) {
    return {
      title: "Article Not Found | Eng.Journal",
      description: "The requested article could not be found.",
    };
  }
}

// 2. Server Component Page rendering post details immediately
const PostDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

 

  let post: BlogPost | null = null;
  let isError = false;

  try {
    post = await getPostBySlug(slug);
  } catch (error) {
    isError = true;
  }

  // Error Card if post is not found
  if (isError || !post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-900/30">
          !
        </div>
        <h2 className="text-lg font-bold">Article Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          The blog post you are trying to view does not exist or may have been deleted.
        </p>
        <Link href="/feed" className="w-full">
          <Button className="w-full cursor-pointer">
            Return to Feed
          </Button>
        </Link>
      </div>
    );
  }

  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const authorName = post.authorId?.name || "Unknown Author";

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full my-8 px-4 sm:px-6 lg:px-8">
      {/* Back to Feed */}
      <div className="mb-6 w-full flex items-center justify-between">
        <div className="w-fit">
          <Link href="/feed">
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
        <DownloadPDFButton post={post} />
      </div>

      {/* Main Post Card container */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        {/* Cover Image */}
        {post.coverImage ? (
          <div className="w-full aspect-video md:max-h-[400px] relative bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center text-muted-foreground/40 border-b border-border/25">
            <ImageIcon className="h-14 w-14 stroke-[1]" />
          </div>
        )}

        <CardContent className="p-6 md:p-10 space-y-6">
          {/* Category Tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider">
              <Tag className="h-3.5 w-3.5" />
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          {/* Author and Date Meta Bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pb-5 border-b border-border/40 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              {authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Published {dateStr}
            </span>
          </div>

          {/* Excerpt section */}
          <p className="text-lg text-muted-foreground italic border-l-4 border-blue-500 pl-4 py-1.5 leading-relaxed bg-blue-50/20 dark:bg-blue-950/10 rounded-r-md">
            {post.excerpt}
          </p>

          {/* Complete Content details */}
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-foreground leading-relaxed pt-2">
            {post.htmlContent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetailPage;
