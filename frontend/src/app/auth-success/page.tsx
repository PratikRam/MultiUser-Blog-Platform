"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";
import { getCurrentUser } from "@/src/api/services/auth.service";
import { toast } from "sonner";

const AuthSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");

      if (!token) {
        toast.error("Authentication failed: No token received.");
        router.push("/login");
        return;
      }

      try {
        // Store token in localStorage
        localStorage.setItem("token", token);

        // Fetch user details with the token
        const responseData = await getCurrentUser();
        const user = responseData?.user || responseData;

        if (!user) {
          throw new Error("User data not found in response");
        }

        // Update auth state in Zustand store
        setAuth(user, token);

        toast.success("Successfully logged in with Google!");

        // Redirect based on user's role
        const role = (user.role || "").toLowerCase();
        const isCreator = role === "creator";
        router.push(isCreator ? "/dashboard" : "/feed");
      } catch (error) {
        console.error("Error fetching user info after Google login:", error);
        toast.error("Failed to retrieve user profile.");
        router.push("/login");
      }
    };

    handleAuth();
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Loading Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-lg font-medium">Completing login...</p>
      </div>
    </div>
  );
};

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}
