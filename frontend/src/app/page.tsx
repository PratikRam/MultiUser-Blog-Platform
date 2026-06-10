'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BookOpen, Layers, Users, Zap } from 'lucide-react';
import LoginForm from '@/src/components/forms/LoginForm';
import { getCurrentUser } from '@/src/api/services/auth.service';
import { useAuthStore } from '@/src/store/auth.store';

const HomePage = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Fetch current user if session cookie already exists
  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false, // Fail fast on 401
  });

  // Handle automatic redirection if already logged in
  useEffect(() => {
    if (isSuccess && data?.user) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setAuth(data.user, token || '');
      
      const isCreator = data?.user?.role?.toLowerCase() === 'creator';
      router.replace(isCreator ? '/dashboard' : '/feed');
    }
  }, [isSuccess, data, router, setAuth]);

  // Show a full-screen loader while checking session
  if (isLoading || (isSuccess && data?.user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 gap-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </div>
        <p className="text-muted-foreground text-sm font-semibold animate-pulse tracking-wide">
          Loading Eng.Journal...
        </p>
      </div>
    );
  }

  // If not logged in (isError is true or data is empty), show the split-screen landing page with Login
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50">
      
      {/* Left side: Premium branding & feature panel (visible on md screens and above) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 flex-col justify-between text-white">
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Eng<span className="text-indigo-400">.Journal</span>
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Where Engineers and Creators Write the Future.
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Collaborate, share knowledge, and explore in-depth blogs crafted by top engineering talent. Sign in to access your dashboard, custom feeds, and reading library.
          </p>

          {/* Feature List Cards (Glassmorphism) */}
          <div className="pt-6 space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/10">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Lightning Fast Insights</h4>
                <p className="text-xs text-slate-400 mt-0.5">Access structured developer tutorials and case studies instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/10">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Role-Based Control</h4>
                <p className="text-xs text-slate-400 mt-0.5">Tailored environment for creators to write and visitors to digest content.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/10">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Collaborative Community</h4>
                <p className="text-xs text-slate-400 mt-0.5">Join thousands of developers sharing production-tested engineering ideas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 mt-2">
          &copy; {new Date().getFullYear()} Eng.Journal. All rights reserved.
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16">
        {/* Mobile Header (Only visible on mobile) */}
        <div className="md:hidden flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Eng<span className="text-indigo-600">.Journal</span>
          </span>
        </div>

        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <LoginForm />
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;