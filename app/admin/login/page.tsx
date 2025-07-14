'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Sparkles } from 'lucide-react';
import { loginAdmin, setAdminAuthenticated } from '@/store/slices/adminSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import jwt from 'jsonwebtoken';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    const isAuthenticated = localStorage.getItem('adminToken') || sessionStorage.getItem('adminSession');
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  // Handle login submission  

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await res.json();
        if (!res.ok || !result.success) {
          setError(result.error || result.message || 'Invalid username or password');
        } else {
          dispatch(setAdminAuthenticated(true)); // <-- set Redux state
          router.push('/admin/dashboard');       // <-- redirect
        }
    } catch (e) {
      setError('An error occurred during login');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/img/header.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-salon-gradient opacity-40"></div>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-purple-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Scissors className="h-16 w-16 text-purple-600 animate-float" />
                <Sparkles className="h-6 w-6 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in to access the Tres Marias admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
             {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
