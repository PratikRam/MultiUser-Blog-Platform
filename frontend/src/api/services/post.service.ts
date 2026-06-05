import api from "@/src/api/axios";
import type { BlogPostFormData } from "@/src/types/index";

const createPost = async (data: BlogPostFormData) => {
  const response = await api.post("/posts", data);
  return response.data;
};

const getAllPosts = async () => {
  const response = await api.get("/posts");
  return response.data;
};

const getPostBySlug = async (slug: string) => {
  const response = await api.get(`/posts/${slug}`);
  return response.data;
};

const getCreatorPosts = async () => {
  const response = await api.get("/posts/creator");
  return response.data;
};

const deletePost = async (id: string) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

const updatePost = async (id: string, data: BlogPostFormData) => {
  const response = await api.put(`/posts/${id}`, data);
  return response.data;
};

export { createPost, getAllPosts, getPostBySlug, getCreatorPosts, deletePost, updatePost };
