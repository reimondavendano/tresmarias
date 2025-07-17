'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  PhilippinePeso,
  Scissors,
  PersonStanding,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';


const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Services', href: '/admin/services', icon: Scissors },
  { name: 'Stylist', href: '/admin/stylists', icon: PersonStanding },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Service Banner', href: '/admin/service_banner', icon: Flag },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get the current path here

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminSession');

    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  // This is the corrected function for active routes
  const isActiveRoute = (href: string) => {
    // If pathname is null or undefined, no route can be active
    if (!pathname) {
      return false;
    }

    // For the root path, check for exact match
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    // For other paths, check if the pathname starts with the href
    // This handles sub-routes like /admin/services/new
    return pathname.startsWith(href);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <img src = {`/assets/img/1.jpg`} alt="Tres Marias Logo" className="h-8 w-8" />
                <span className="font-bold text-lg text-salon-primary">
                  Tres Marias Salon
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors text-left ${
                    isActiveRoute(item.href)
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 w-full p-6">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:bg-white lg:border-r lg:block">
        <div className="flex items-center space-x-2 p-6 border-b">
          <img src = {`/assets/img/1.jpg`} alt="Tres Marias Logo" className="h-8 w-8" />
          <span className="font-bold text-xl text-salon-primary">
            Tres Marias Salon
          </span>
        </div>
        <nav className="mt-8">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors text-left ${
                isActiveRoute(item.href)
                  ? 'bg-blue-50 text-salon-primary border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white border-b px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-salon-primary transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleNavigation('/')}
                className="text-sm text-salon-primary hover:text-text-salon-primary transition-colors"
              >
                View Website
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
