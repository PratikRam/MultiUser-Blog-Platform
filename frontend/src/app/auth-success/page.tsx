'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { getCurrentUser } from '@/src/api/services/auth.service';
import { useAuthStore } from '@/src/store/auth.store';

const AuthSuccessHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      toast.error('Authentication failed: No token received.');
      router.push('/login');
      return;
    }

    // Save token to localStorage
    localStorage.setItem('token', token);

    // Fetch user details and store in Zustand auth store
    const fetchUserAndRedirect = async () => {
      try {
        const user = await getCurrentUser();
        setAuth(user, token);
        toast.success('Successfully logged in with Google!');
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Failed to retrieve user profile:', error);
        toast.error('Failed to complete sign-in. Please try again.');
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchUserAndRedirect();
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-gray-700">Completing login...</h2>
        <p className="text-sm text-gray-500">Please wait while we retrieve your profile details.</p>
      </div>
    </div>
  );
};

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          </div>
        </div>
      }
    >
      <AuthSuccessHandler />
    </Suspense>
  );
}
