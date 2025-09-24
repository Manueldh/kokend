'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChefHat, Home, Settings, BookOpen, LogOut, User, Heart } from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }) {
  const { user, isAuthenticated, logout } = useUser();
  const pathname = usePathname();
  
  // Don't show nav on login page
  const isLoginPage = pathname === '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation Header */}
      {!isLoginPage && (
        <header className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
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

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isLoginPage ? '' : 'py-8'}`}>
        {children}
      </main>

      {/* Footer */}
      {!isLoginPage && (
        <footer className="bg-white/50 backdrop-blur-sm border-t border-orange-200 mt-20">
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
