'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('kokendUser');
    if (user) {
      window.location.href = '/recepten';
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user info in localStorage
        localStorage.setItem('kokendUser', JSON.stringify(data.user));
        // Redirect to recipes page
        window.location.href = '/recepten';
      } else {
        setError(data.error || 'Er is een fout opgetreden');
      }
    } catch (error) {
      setError('Kan geen verbinding maken met de server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-800">
            🍳 Kokend
          </CardTitle>
          <CardDescription>
            Voer je gebruikersnaam in om je recepten en keuken te bekijken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Gebruikersnaam</Label>
              <Input
                id="username"
                type="text"
                placeholder="Je gebruikersnaam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                className="w-full"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading || username.trim().length < 2}
            >
              {isLoading ? 'Inloggen...' : 'Inloggen'}
            </Button>
          </form>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Geen wachtwoord nodig - vul gewoon je gebruikersnaam in!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}