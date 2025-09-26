'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChefHat, Home, Settings, BookOpen, LogOut, User, Heart, Trophy } from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { usePathname } from 'next/navigation';
import MobileErrorBoundary from '../MobileErrorBoundary';

export default function MainLayout({ children }) {
  const { user, isAuthenticated, logout } = useUser();
  const pathname = usePathname();
  
  // Don't show nav on login page
  const isLoginPage = pathname === '/login';

  const navigationItems = [
    { href: '/', icon: Home, label: 'Home', requiresAuth: false },
    { href: '/recepten', icon: BookOpen, label: 'Recepten', requiresAuth: true },
    { href: '/keuken', icon: Settings, label: 'Keuken', requiresAuth: true },
    { href: '/voorkeuren', icon: Heart, label: 'Voorkeuren', requiresAuth: true },
    { href: '/achievements', icon: Trophy, label: 'Achievements', requiresAuth: true },
  ];

  const visibleNavItems = navigationItems.filter(item => 
    !item.requiresAuth || (item.requiresAuth && isAuthenticated)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Desktop Navigation Header - Only visible ≥1000px */}
      {!isLoginPage && (
        <header className="hidden min-[1000px]:block bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-800">Kokend</span>
              </Link>
              
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-1">
                  <Button variant="ghost" asChild>
                    <Link href="/" className="flex items-center space-x-2">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </Button>
                  {isAuthenticated && (
                    <>
                      <Button variant="ghost" asChild>
                        <Link href="/recepten" className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Recepten</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href="/keuken" className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Keuken</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href="/voorkeuren" className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" />
                          <span>Voorkeuren</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href="/achievements" className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <span>Achievements</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </nav>
                
                {/* User section */}
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2 border-l border-orange-200 pl-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-700">{user?.displayName || user?.username}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={logout}
                      className="flex items-center space-x-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Uitloggen</span>
                    </Button>
                  </div>
                ) : (
                  <Button asChild>
                    <Link href="/login">Inloggen</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Header - Only logo, shown <1000px */}
      {!isLoginPage && (
        <header className="max-[999px]:block min-[1000px]:hidden bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-800">Kokend</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Add bottom padding on mobile for bottom nav */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isLoginPage ? '' : 'py-8 pb-24 min-[1000px]:pb-8'}`}>
        <MobileErrorBoundary>
          {children}
        </MobileErrorBoundary>
      </main>

      {/* Mobile Bottom Navigation - Only visible <1000px */}
      {!isLoginPage && (
        <nav className="max-[999px]:block min-[1000px]:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-orange-200">
          <div className="flex justify-center px-4 py-3">
            <div className="flex items-center justify-around bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg border border-orange-200 max-w-md w-full mx-auto">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center px-2 py-2 rounded-full transition-colors duration-200 ${
                      isActive 
                        ? 'bg-orange-100 text-orange-600' 
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : ''}`} />
                    <span className="text-xs font-medium mt-1 hidden min-[600px]:block whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Login/Logout button */}
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="flex flex-col items-center px-2 py-2 rounded-full transition-colors duration-200 text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-xs font-medium mt-1 hidden min-[600px]:block whitespace-nowrap">Uitloggen</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex flex-col items-center px-2 py-2 rounded-full transition-colors duration-200 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-medium mt-1 hidden min-[600px]:block whitespace-nowrap">Login</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Desktop Footer - Only visible ≥1000px */}
      {!isLoginPage && (
        <footer className="hidden min-[1000px]:block bg-white/50 backdrop-blur-sm border-t border-orange-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-600">
              <p>© 2025 Kokend - Je persoonlijke kook-assistent met AI</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
