'use client';

import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { registerUser } from '@/src/api/services/auth.service';
import type { RegisterFormData } from '@/src/types/index';

interface ErrorResponse {
  message: string;
}

const RegisterForm = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'VISITOR' | 'CREATOR'>('VISITOR');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>(
    {
      defaultValues: {
        name: '',
        email: '',
        password: '',
        role: 'VISITOR',
      },
    }
  );

  const { mutate: register_user, isPending } = useMutation({
    mutationFn: (data: RegisterFormData) => registerUser(data),
    onSuccess: () => {
      toast.success('Registration successful!');
      setTimeout(() => router.push('/login'), 2000);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    if (!data.name.trim() || !data.email.trim() || !data.password.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    register_user(data);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as 'VISITOR' | 'CREATOR');
    setValue('role', value as 'VISITOR' | 'CREATOR');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISITOR">Visitor - Read blogs</SelectItem>
                <SelectItem value="CREATOR">Creator - Write blogs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Register'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;