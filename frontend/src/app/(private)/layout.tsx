'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Navbar from '@/src/components/navbar';
import Footer from '@/src/components/footer';
import { getCurrentUser } from '@/src/api/services/auth.service';
import { useAuthStore } from '@/src/store/auth.store';

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  // Fetch current user details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false, // Do not retry on authentication failure
  });

  useEffect(() => {
    if (data?.user) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setAuth(data.user, token || '');
    }
  }, [data, setAuth]);

  useEffect(() => {
    if (isError) {
      console.log("PrivateLayout - Auth Check Failed! Error:");
      logout();
      if (typeof window !== 'undefined') {
        console.log("Hello");
        localStorage.removeItem('token');
      }
    
      router.replace('/');
    }
  }, [isError, logout, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50/50 gap-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="absolute w-16 h-16 border-2 border-blue-600/10 rounded-full"></div>
        </div>
        <p className="text-muted-foreground text-sm font-semibold animate-pulse tracking-wide">
          Verifying your session...
        </p>
      </div>
    );
  }

  // If there's an error, the layout will redirect, so we don't render children.
  if (isError || !data?.user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default PrivateLayout;