"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  PenTool, 
  Eye, 
  Loader2, 
  Image as ImageIcon, 
  Tag, 
  FileText,
  Search,
  CheckCircle2,
  Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getCurrentUser } from "@/src/api/services/auth.service";
import { createPost } from "@/src/api/services/post.service";
import { BlogPostSchema } from "@/src/types/index";

const CreateBlogPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("edit"); // "edit" | "preview"

  // 1. Fetch current user to verify role is CREATOR
  const { data: profileData, isLoading: isUserLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: 1,
  });

  const user = profileData?.user;
  const isCreator = user?.role?.toLowerCase() === "creator";

  // Redirect visitors or unauthorized users
  useEffect(() => {
    if (isError) {
      toast.error("Session expired or unauthorized. Please log in.");
      router.push("/login");
    }
  }, [isError, router]);

  // 2. React Hook Form setup with Zod Schema Validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(BlogPostSchema),
    defaultValues: {
      title: "",
      htmlContent: "",
      category: "",
      coverImage: "",
      excerpt: "",
      seoKeywords: "",
      status: "PUBLISHED",
    },
  });

  // Watch fields in real-time for the preview mode
  const title = watch("title");
  const htmlContent = watch("htmlContent");
  const category = watch("category");
  const coverImage = watch("coverImage");
  const excerpt = watch("excerpt");
  const status = watch("status");

  // 3. Blog post creation mutation
  const { mutate: mutateCreatePost, isPending: isSubmitting } = useMutation({
    mutationFn: (data) => createPost(data),
    onSuccess: (data) => {
      toast.success(data?.status === "DRAFT" ? "Draft saved successfully!" : "Blog post published successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to save post";
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    mutateCreatePost(data);
  };

  // Status toggle handlers for form submission
  const setStatusAndSubmit = (statusType) => {
    setValue("status", statusType);
  };

  // Loading State
  if (isUserLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Verifying creator account permissions...
        </p>
      </div>
    );
  }

  // Access Denied State
  if (!user || !isCreator) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/30">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Only users with the Creator role are authorized to write and publish blog articles.
        </p>
        <Button onClick={() => router.push("/feed")} className="w-full">
          Return to Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full my-8 px-4 sm:px-6 lg:px-8">
      {/* Page Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Create Blog Post
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Draft a new article, customize SEO keywords, and publish or save as a draft.
        </p>
      </div>

      {/* Write / Preview Mode Selector */}
      <div className="flex border-b border-border/40 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "edit"
              ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PenTool className="h-4 w-4" />
          Write Post
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "preview"
              ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-4 w-4" />
          Live Preview
        </button>
      </div>

      {/* Main Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {activeTab === "edit" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Primary Details (Left 2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-border/50 shadow-xs">
                <CardContent className="pt-6 space-y-5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-sm font-semibold">
                      Post Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Understanding Next.js 16 App Router"
                      className="h-10 text-base"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <Label htmlFor="excerpt" className="text-sm font-semibold">
                      Excerpt / Summary
                    </Label>
                    <textarea
                      id="excerpt"
                      placeholder="Provide a brief summaries/teaser of your blog post (visible on feed cards)..."
                      rows={3}
                      className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...register("excerpt")}
                    />
                    {errors.excerpt && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.excerpt.message}
                      </p>
                    )}
                  </div>

                  {/* Content Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="htmlContent" className="text-sm font-semibold">
                        Blog Content
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        Line breaks are preserved in rendering
                      </span>
                    </div>
                    <textarea
                      id="htmlContent"
                      placeholder="Write your article content here..."
                      rows={14}
                      className="w-full min-h-[300px] px-3 py-2 rounded-lg border border-input bg-background font-sans text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...register("htmlContent")}
                    />
                    {errors.htmlContent && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.htmlContent.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar / Settings (Right Column) */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border border-border/50 shadow-xs">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-base font-bold">Metadata & Configuration</CardTitle>
                  <CardDescription>Adjust categories and search criteria</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Category
                    </Label>
                    <Input
                      id="category"
                      placeholder="e.g., Programming, Travel, Health"
                      className="h-10"
                      {...register("category")}
                    />
                    {errors.category && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-1.5">
                    <Label htmlFor="coverImage" className="text-sm font-semibold flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      Cover Image URL
                    </Label>
                    <Input
                      id="coverImage"
                      type="url"
                      placeholder="e.g., https://example.com/cover.jpg"
                      className="h-10"
                      {...register("coverImage")}
                    />
                    {errors.coverImage && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.coverImage.message}
                      </p>
                    )}
                    {coverImage && !errors.coverImage && (
                      <div className="mt-2.5 rounded-lg overflow-hidden border border-border/40 aspect-video relative bg-muted flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={coverImage} 
                          alt="Cover preview" 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* SEO Keywords */}
                  <div className="space-y-1.5">
                    <Label htmlFor="seoKeywords" className="text-sm font-semibold flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      SEO Keywords
                    </Label>
                    <Input
                      id="seoKeywords"
                      placeholder="e.g., react, learning, tutorial"
                      className="h-10"
                      {...register("seoKeywords")}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Comma separated tags to help locate your post
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Live Preview Mode */
          <Card className="border border-border/50 shadow-xs max-w-3xl mx-auto overflow-hidden">
            {coverImage ? (
              <div className="w-full aspect-video md:max-h-[350px] relative bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={coverImage} 
                  alt={title || "Blog Cover"} 
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 stroke-[1]" />
              </div>
            )}
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Category Badge */}
              {category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider">
                  {category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {title || "Untitled Blog Post"}
              </h1>

              {/* Author and Date Mockup */}
              <div className="flex items-center gap-3 pt-1 border-y border-border/40 py-3 text-xs text-muted-foreground">
                <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 flex items-center justify-center font-bold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.name || "Author Name"}</p>
                  <p className="mt-0.5">Estimated Reading Time: {Math.max(1, Math.round((htmlContent || "").split(" ").length / 200))} min read</p>
                </div>
              </div>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-base text-muted-foreground italic border-l-4 border-blue-500 pl-4 py-1">
                  {excerpt}
                </p>
              )}

              {/* Main Content Render */}
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-foreground leading-relaxed pt-2">
                {htmlContent || <span className="text-muted-foreground italic">No content written yet. Use the Edit tab to begin writing.</span>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="outline"
            onClick={() => setStatusAndSubmit("DRAFT")}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[140px] h-11 cursor-pointer"
          >
            {isSubmitting && status === "DRAFT" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving Draft...
              </>
            ) : (
              "Save as Draft"
            )}
          </Button>

          <Button
            type="submit"
            onClick={() => setStatusAndSubmit("PUBLISHED")}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white h-11 cursor-pointer"
          >
            {isSubmitting && status === "PUBLISHED" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Publishing...
              </>
            ) : (
              "Publish Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage;