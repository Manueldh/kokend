'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, Utensils, Lightbulb, Timer, ThermometerSun, CheckCircle } from "lucide-react";
import { useUser } from '../components/UserProvider';
import { apiUrl } from '../lib/api';
import DigitalStove from "@/components/DigitalStove";
import { normalizeIngredient, ingredientMatches } from '@/lib/utils';
import { useUser } from "@/components/UserProvider";

export default function HomePage() {
  const { user } = useUser();
  const [ingredienten, setIngredienten] = useState('');
  const [gerecht, setGerecht] = useState('');
  const [servings, setServings] = useState(2);
  const [onlyUseMyIngredients, setOnlyUseMyIngredients] = useState(true);
  const [recept, setRecept] = useState(null);
  const [ownedIngredients, setOwnedIngredients] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Shared burner state for all DigitalStove components
  const [burners, setBurners] = useState([
    { id: 1, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 2, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 3, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 4, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCompletedSteps([]); // Reset completed steps
    
    // Reset burner state for new recipe
    setBurners([
      { id: 1, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
      { id: 2, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
      { id: 3, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
      { id: 4, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' }
    ]);
    
    try {
      const response = await fetch(apiUrl('/api/recipes/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || null, // null for guest users
          ingredients: ingredienten,
          request: gerecht,
          servings,
          onlyUseMyIngredients,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecept(data);
        // initialize owned ingredients
        const userText = (data.userIngredients || '').toLowerCase();
        const owned = new Set();
        (data.ingredients || []).forEach(ing => {
          if (!ing.name) return;
          if (ingredientMatches(ing.name, userText)) {
            owned.add(normalizeIngredient(ing.name));
          }
        });
        setOwnedIngredients(owned);
      } else {
        console.error('Error generating recipe');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepNumber) => {
    setCompletedSteps(prev => [...new Set([...prev, stepNumber])]);
  };

  const toggleOwned = (ing) => {
    const norm = normalizeIngredient(ing.name || ing);
    setOwnedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(norm)) next.delete(norm); else next.add(norm);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-3">
          <ChefHat className="h-12 w-12 text-orange-600" />
          <h1 className="text-5xl font-bold text-gray-800">Kokend</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Je persoonlijke AI kook-assistent met digitaal fornuis. Krijg stap-voor-stap instructies met slimme timers!
        </p>
        
        {/* User Status */}
        {user ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-green-800 text-sm">
              👋 Welkom terug, {user.displayName || user.username}! Je recepten worden automatisch opgeslagen.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> <a href="/login" className="underline hover:no-underline">Log in</a> om je recepten automatisch op te slaan en je keukenapparatuur te beheren!
            </p>
          </div>
        )}
      </div>

      {/* Recipe Generator Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Utensils className="h-5 w-5 text-orange-600" />
            <span>Genereer een recept</span>
          </CardTitle>
          <CardDescription>
            Vul je ingrediënten en gewenste gerecht in om een persoonlijk recept met slimme timers te krijgen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ingredienten">Welke ingrediënten heb je?</Label>
              <Textarea
                id="ingredienten"
                value={ingredienten}
                onChange={(e) => setIngredienten(e.target.value)}
                placeholder="Bijvoorbeeld: kip, paprika, rijst, knoflook, ui, sojasaus..."
                className="min-h-24"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="gerecht">Wat wil je maken?</Label>
                <Input
                  id="gerecht"
                  value={gerecht}
                  onChange={(e) => setGerecht(e.target.value)}
                  placeholder="Bijvoorbeeld: curry, pasta, stir-fry, soep..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Porties</Label>
                <select
                  id="servings"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} portie{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                id="onlyUseMyIngredients"
                type="checkbox"
                checked={onlyUseMyIngredients}
                onChange={(e) => setOnlyUseMyIngredients(e.target.checked)}
                className="h-4 w-4 rounded border-input text-orange-600 mt-1"
              />
              <Label htmlFor="onlyUseMyIngredients" className="!mb-0 font-normal text-sm">Wil je dat de AI uitsluitend jouw ingrediënten gebruikt?</Label>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  AI maakt je recept...
                </>
              ) : (
                <>
                  <ChefHat className="h-4 w-4 mr-2" />
                  Genereer Recept met Slimme Timers
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recipe Result with Digital Stove */}
      {recept && (
        <div className="space-y-6">
          {/* Mobile: Fornuis bovenaan */}
          <div className="lg:hidden">
            <DigitalStove 
              recipe={recept} 
              onStepComplete={handleStepComplete} 
              showSteps={false} 
              showStoveInterface={true}
              burners={burners}
              setBurners={setBurners}
            />
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recipe Info + Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipe Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-700">
                    🍽️ {recept.title}
                  </CardTitle>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{recept.totalTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{recept.servings} porties</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Utensils className="h-4 w-4" />
                      <span className="capitalize">{recept.difficulty}</span>
                    </div>
                  </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Ingrediënten</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(recept.ingredients || []).map((ing, idx) => {
                          const norm = normalizeIngredient(ing.name || '');
                          const has = ownedIngredients.has(norm);
                          return (
                            <button key={idx} onClick={() => toggleOwned(ing)} className={`${has ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'} rounded-md p-2 text-sm text-left`}>
                              <div className="font-medium">{ing.name}{ing.amount ? ` — ${ing.amount}${ing.unit ? ' ' + ing.unit : ''}` : ''}</div>
                              {!has && <div className="text-xs text-gray-500 mt-1">Ontbreekt</div>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
              </Card>

              {/* Recipe Steps with Stove Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-orange-600" />
                    <span>Stappenplan</span>
                  </CardTitle>
                  <CardDescription>
                    Sleep stappen naar het digitaal fornuis voor de beste timing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DigitalStove 
                    recipe={recept} 
                    onStepComplete={handleStepComplete} 
                    showSteps={true} 
                    showStoveInterface={false}
                    burners={burners}
                    setBurners={setBurners}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Desktop: Fornuis rechts */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <DigitalStove 
                  recipe={recept} 
                  onStepComplete={handleStepComplete} 
                  showSteps={false} 
                  showStoveInterface={true}
                  burners={burners}
                  setBurners={setBurners}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
