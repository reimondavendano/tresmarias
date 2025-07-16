import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Link from 'next/link'; // Import Link from next/link

interface LoginFormProps {
  onSubmit: (credentials: { username: string; password: string }) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-salon-dark font-medium">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            className="pl-10"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-salon-dark font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="pl-10 pr-10"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-salon-primary hover:bg-salon-primary/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>


    </form>
  );
};
