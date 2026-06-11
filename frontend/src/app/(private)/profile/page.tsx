'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Shield,
  Lock,
  Edit2,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCurrentUser, updateProfile, logoutUser } from '@/src/api/services/auth.service';
import { useAuthStore } from '@/src/store/auth.store';
import { UpdateProfileSchema, type UpdateProfileFormData } from '@/src/types/index';

interface ErrorResponse {
  message: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('token');
      logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };


  // 1. Fetch current user profile
  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: 1,
  });

  const user = profileData?.user;

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'VISITOR',
      password: '',
      confirmPassword: '',
    },
  });


  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      const mappedRole = (user.role || 'visitor').toUpperCase() as 'VISITOR' | 'CREATOR';
      reset({
        name: user.name || '',
        email: user.email || '',
        role: mappedRole,
        password: '',
        confirmPassword: '',
      });
      // Also make sure store is in sync
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        setAuth(user, token);
      }
    }
  }, [user, reset, setAuth]);

  // Handle redirect if unauthorized
  useEffect(() => {
    if (isError) {
      toast.error('Session expired or unauthorized. Please log in.');
      router.push('/login');
    }
  }, [isError, router]);

  // 2. Profile update mutation
  const { mutate: mutateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateProfileFormData) => updateProfile(data),
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      setIsEditMode(false);
      setShowPasswordSection(false);

      // Update store
      if (data?.user && data?.token) {
        localStorage.setItem('token', data.token);
        setAuth(data.user, data.token);
      } else if (data?.user) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) setAuth(data.user, token);
      }

      // Refresh the query cache
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    // If password section is not shown, clean up those fields before sending
    const payload = { ...data };
    if (!showPasswordSection) {
      delete payload.password;
      delete payload.confirmPassword;
    }
    mutateProfile(payload);
  };

  const handleCancel = () => {
    if (user) {
      const mappedRole = (user.role || 'visitor').toUpperCase() as 'VISITOR' | 'CREATOR';
      reset({
        name: user.name || '',
        email: user.email || '',
        role: mappedRole,
        password: '',
        confirmPassword: '',
      });
    }
    setIsEditMode(false);
    setShowPasswordSection(false);
  };


  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Loading profile details...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user avatar initials
  const initials = user.name
    ? user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'U';

  const userRoleFormatted = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : 'Visitor';

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full my-8 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Account Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information, email address, user role, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Overview */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden border border-border/50 shadow-xs">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 h-24 w-full relative">
              {/* Optional Header Banner Cover */}
            </div>
            <CardContent className="pt-0 pb-6 flex flex-col items-center text-center -mt-12 relative z-10">
              <div className="h-24 w-24 rounded-full border-4 border-background bg-gradient-to-br from-indigo-100 to-blue-50 text-blue-700 flex items-center justify-center text-2xl font-bold shadow-md select-none transition-transform duration-300 hover:scale-102">
                {initials}
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">
                {user.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {user.email}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                <Shield className="h-3 w-3" />
                {userRoleFormatted}
              </div>

              <Button
                variant="destructive"
                onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Form / Details */}
        <div className="md:col-span-2">
          <Card className="border border-border/50 shadow-xs">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Personal Details</CardTitle>
                  <CardDescription>Update your personal details and account role</CardDescription>
                </div>
                {!isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-1.5 h-9"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  {isEditMode ? (
                    <div>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="h-10"
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground py-2 px-3 bg-secondary/30 rounded-lg border border-transparent">
                      {user.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  {isEditMode ? (
                    <div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-10"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground py-2 px-3 bg-secondary/30 rounded-lg border border-transparent">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Role Field */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Account Role <span className='text-xs text-muted-foreground '> (You can change the role)</span>
                  </Label>
                  {isEditMode ? (
                    <div>
                      <select
                        id="role"
                        className="flex h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                        {...register('role')}
                      >
                        <option value="VISITOR" className="bg-background text-foreground">Visitor - Read blogs</option>
                        <option value="CREATOR" className="bg-background text-foreground">Creator - Write blogs</option>
                      </select>
                      {errors.role && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.role.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground py-2 px-3 bg-secondary/30 rounded-lg border border-transparent">
                      {userRoleFormatted} (Access: {user.role === 'creator' ? 'Write & Publish' : 'Read Only'})
                    </p>
                  )}
                </div>

                {/* Password modification section (Only visible when editing) */}
                {isEditMode && (
                  <div className="pt-4 border-t border-border/40">
                    {!showPasswordSection ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswordSection(true)}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 px-0 h-9"
                      >
                        <KeyRound className="h-4 w-4" />
                        Want to change your password?
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-foreground">Change Password</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowPasswordSection(false);
                              setValue('password', '');
                              setValue('confirmPassword', '');
                            }}
                            className="text-muted-foreground hover:text-foreground h-7 px-2"
                          >
                            Cancel Password Change
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold flex items-center gap-1">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                              New Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="h-10 pr-10"
                                {...register('password')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-hidden"
                              >
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {errors.password && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.password.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-xs font-semibold flex items-center gap-1">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="h-10 pr-10"
                                {...register('confirmPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-hidden"
                              >
                                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.confirmPassword.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Action Buttons */}
                {isEditMode && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border/40 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 h-10"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] h-10"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;