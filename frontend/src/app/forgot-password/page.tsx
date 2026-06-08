'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/src/api/axios';

interface ErrorResponse {
  message: string;
}

type Step = 'EMAIL' | 'OTP' | 'RESET';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Forms
  const emailForm = useForm<{ email: string }>();
  const otpForm = useForm<{ otp: string }>();
  const resetForm = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  // 1. Request OTP Mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await api.post('/auth/forgot-password', data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success('OTP sent successfully!');
      setEmail(variables.email);
      if (data?.otp) {
        setDevOtp(data.otp);
      }
      setStep('OTP');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to request OTP');
    }
  });

  // 2. Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await api.post('/auth/verify-otp', data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success('OTP verified! Please set a new password.');
      setOtp(variables.otp);
      setStep('RESET');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    }
  });

  // 3. Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await api.post('/auth/reset-password', { email, otp, password });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4 select-none">
      
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
          <KeyRound className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Eng<span className="text-indigo-600">.Journal</span>
        </span>
      </div>

      <Card className="w-full max-w-md border border-border/50 shadow-md">
        
        {/* STEP 1: ENTER EMAIL */}
        {step === 'EMAIL' && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>
                Enter your account email to receive a 6-digit verification code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form 
                onSubmit={emailForm.handleSubmit((data) => requestOtpMutation.mutate(data))} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    className="h-10"
                    {...emailForm.register('email', { required: 'Email is required' })} 
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-xs text-red-500">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={requestOtpMutation.isPending} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 shadow-xs cursor-pointer"
                >
                  {requestOtpMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send Verification OTP'
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link 
                    href="/" 
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-600 font-medium transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'OTP' && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
              <CardDescription>
                We have sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form 
                onSubmit={otpForm.handleSubmit((data) => verifyOtpMutation.mutate({ email, otp: data.otp }))} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-sm font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    Verification Code
                  </Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    maxLength={6}
                    className="h-10 text-center tracking-widest text-lg font-bold"
                    {...otpForm.register('otp', { 
                      required: 'OTP code is required',
                      minLength: { value: 6, message: 'OTP must be 6 digits' }
                    })} 
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-xs text-red-500">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>

                {/* Dev Helper */}
                {devOtp && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs text-center border border-amber-100 dark:border-amber-900/30">
                    <span className="font-bold">Dev Helper:</span> Your verification OTP is <span className="font-mono font-extrabold text-sm tracking-wider select-text">{devOtp}</span>.
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={verifyOtpMutation.isPending} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 shadow-xs cursor-pointer"
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying Code...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setStep('EMAIL');
                      setDevOtp(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Change Email
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 'RESET' && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">New Password</CardTitle>
              <CardDescription>
                Set a strong and secure new password for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form 
                onSubmit={resetForm.handleSubmit((data) => {
                  if (data.password !== data.confirmPassword) {
                    toast.error('Passwords do not match!');
                    return;
                  }
                  resetPasswordMutation.mutate(data.password);
                })} 
                className="space-y-4"
              >
                {/* Password input */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    New Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-10"
                    {...resetForm.register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })} 
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-xs text-red-500">{resetForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password input */}
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-10"
                    {...resetForm.register('confirmPassword', { 
                      required: 'Please confirm your password' 
                    })} 
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={resetPasswordMutation.isPending} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 shadow-xs cursor-pointer"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}

      </Card>
    </div>
  );
}
