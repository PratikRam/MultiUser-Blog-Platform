"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/src/api/services/auth.service";
import { deleteCookie } from "@/src/lib/cookies";

const Dashboard = () => {
    const router = useRouter();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        retry: false, // Don't retry since unauthorized status won't change
    });

    // If query fails, clear invalid token and redirect to login
    useEffect(() => {
        if (isError) {
            localStorage.removeItem("token");
            deleteCookie("token");
            router.replace("/login");
        }
    }, [isError, router]);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return null; // Prevents flashing empty content before redirecting
    }

    return (
        <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md">
         
        </div>
    )
}

export default Dashboard;
