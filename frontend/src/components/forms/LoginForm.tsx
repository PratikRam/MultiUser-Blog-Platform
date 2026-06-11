'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

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

import { loginUser } from '@/src/api/services/auth.service';
import { useAuthStore } from '@/src/store/auth.store';

type LoginFormData = {
  email: string;
  password: string;
};

interface ErrorResponse {
  message: string;
}

const LoginForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>
      (
        {
          defaultValues: {
            email: '',
            password: '',
          },
        }
      );

  const { mutate: login_user, isPending } = useMutation({
    mutationFn: (data: LoginFormData) => loginUser(data),

    onSuccess: (data) => {
      toast.success('Login successful!');
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      if (data?.user && data?.token) {
        setAuth(data.user, data.token);
      }
      const isCreator = data?.user?.role?.toLowerCase() === 'creator';
      router.push(isCreator ? '/dashboard' : '/feed');
    },

    onError: (error: AxiosError<ErrorResponse>) => {
      const message =
        error.response?.data?.message || 'Login failed';

      toast.error(message);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login_user(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Login
        </CardTitle>

        <CardDescription>
          Login to your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              {...register('email', {
                required: 'Email is required',
              })}
            />

            {errors.email && (
              <p className="text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Label className='flex justify-end text-blue-600 cursor-pointer hover:underline'> <Link href="/forgot-password">Forgot Password?</Link> </Label>

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
              })}
            />

            {errors.password && (
              <p className="text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>


          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>

          <div className="relative my-4 flex items-center justify-center">
            <span className="absolute w-full border-t border-gray-200" />
            <span className="relative bg-white px-3 text-xs text-gray-500 uppercase">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              const apiBase = 'http://localhost:8080/api';
              window.location.href = `${apiBase}/auth/google`;
            }}
          >
            <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
          </Button>
        </form>

        <p className="text-sm text-center mt-4">
          Do not have an account?
          <Link
            href="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginForm;