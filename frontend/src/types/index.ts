import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
 role: z.enum(['VISITOR', 'CREATOR'], {
  message: 'Please select a valid role',
})
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['VISITOR', 'CREATOR'], {
    message: 'Please select a valid role',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

export const BlogPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  htmlContent: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  coverImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  seoKeywords: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

export type BlogPostFormData = z.infer<typeof BlogPostSchema>;
