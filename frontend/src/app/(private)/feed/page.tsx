"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, User, Tag, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllPosts } from "@/src/api/services/post.service";

interface PostAuthor {
  name: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  createdAt: string;
  authorId?: PostAuthor;
}

const FeedPage = () => {
  const { data: posts, isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ["posts"],
    queryFn: getAllPosts,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Loading latest articles...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 flex items-center justify-center mb-4">
          !
        </div>
        <h2 className="text-lg font-bold">Failed to Load Feed</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Something went wrong while fetching articles. Please refresh or try again later.
        </p>
      </div>
    );
  }

  const publishedPosts = posts || [];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full my-8 px-4 sm:px-6 lg:px-8">
      {/* Feed Page Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Article Feed
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl">
          Explore the latest posts, ideas, and stories from developers and creators across the platform.
        </p>
      </div>

      {publishedPosts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 border border-dashed rounded-2xl bg-muted/20 text-center max-w-2xl mx-auto px-4">
          <BookOpen className="h-12 w-12 text-muted-foreground/60 mb-4 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-foreground">No posts published yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Be the first to share your thoughts by creating a new post from the dashboard.
          </p>
          <Link
            href="/dashboard/create-blog"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-xs"
          >
            Write First Post
          </Link>
        </div>
      ) : (
        /* Responsive 2-to-3 Column Post Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {publishedPosts.map((post) => {
            const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const authorName = post.authorId?.name || "Unknown Author";

            return (
              <Card 
                key={post._id} 
                className="overflow-hidden border border-border/50 shadow-xs flex flex-col group hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Cover Image */}
                <Link href={`/feed/${post.slug}`} className="block overflow-hidden aspect-video bg-muted relative">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center text-muted-foreground/60">
                      <BookOpen className="h-8 w-8 stroke-[1.5]" />
                    </div>
                  )}
                  {/* Category Badge overlayed */}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-background/95 text-foreground dark:bg-background/90 border border-border/50 backdrop-blur-xs uppercase tracking-wider">
                    <Tag className="h-2.5 w-2.5" />
                    {post.category}
                  </span>
                </Link>

                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta info (Author & Date) */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {dateStr}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      <Link href={`/feed/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt / Summary */}
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Read More link */}
                  <div className="pt-2 border-t border-border/30 mt-auto">
                    <Link
                      href={`/feed/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition-transform duration-200"
                    >
                      Read Article
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
