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
      router.push('/Dashboard');
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
              placeholder="john@example.com"
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