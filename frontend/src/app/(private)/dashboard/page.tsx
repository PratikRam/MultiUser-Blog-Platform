"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  FileText,
  Loader2, 
  Eye, 
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCreatorPosts, deletePost } from "@/src/api/services/post.service";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

const CreatorDashboard = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Creator's Posts
  const { data: posts, isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ["creatorPosts"],
    queryFn: getCreatorPosts,
    retry: 1,
  });

  // 2. Delete Mutation
  const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["creatorPosts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Invalidate public feed too
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete post";
      toast.error(message);
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      mutateDelete(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Loading creator dashboard panel...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Failed to Load Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Unable to retrieve your posts list. Make sure you are authorized and logged in.
        </p>
      </div>
    );
  }

  const creatorPosts = posts || [];

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-8">
      {/* Welcome Banner / Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100/30 dark:border-blue-900/10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Creator Dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-lg">
            Manage your posts, analyze draft items, edit articles, and publish new content.
          </p>
        </div>
        <Link href="/dashboard/create-blog">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 h-11 shadow-xs shrink-0 cursor-pointer">
            <Plus className="h-5 w-5" />
            Write Post
          </Button>
        </Link>
      </div>

      {/* Admin Panel Style Post Manager */}
      <Card className="border border-border/50 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-border/40 bg-muted/10 flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Manage Articles ({creatorPosts.length})
            </h3>
          </div>

          {creatorPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <FileText className="h-12 w-12 text-muted-foreground/60 mb-4 stroke-[1.5]" />
              <h4 className="font-bold text-foreground">No articles created yet</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs">
                You haven't written any posts. Get started by drafting your first article!
              </p>
              <Link href="/dashboard/create-blog">
                <Button variant="outline" className="h-10 cursor-pointer">
                  Create First Post
                </Button>
              </Link>
            </div>
          ) : (
            /* Admin list view */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase bg-muted/30">
                    <th className="py-4 px-6">Post Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date Created</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {creatorPosts.map((post) => {
                    const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr 
                        key={post._id} 
                        className="hover:bg-muted/10 transition-colors duration-150 group"
                      >
                        {/* Title */}
                        <td className="py-4 px-6 max-w-md">
                          <div className="font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {post.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5 max-w-[350px]">
                            {post.excerpt}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground py-1 px-2.5 bg-secondary/50 rounded-lg border border-border/40">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {post.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {post.status === "PUBLISHED" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Date Created */}
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formattedDate}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Live (Only for Published) */}
                            {post.status === "PUBLISHED" && (
                              <Link href={`/feed/${post.slug}`} target="_blank">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                                  title="View Article"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}

                            {/* Edit */}
                            <Link href={`/dashboard/edit-blog/${post.slug}`}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30 cursor-pointer"
                                title="Edit Article"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(post._id, post.title)}
                              disabled={isDeleting}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default CreatorDashboard;