'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, Utensils, Lightbulb, Timer, ThermometerSun, CheckCircle } from "lucide-react";
import DigitalStove from "@/components/DigitalStove";

export default function HomePage() {
  const [ingredienten, setIngredienten] = useState('');
  const [gerecht, setGerecht] = useState('');
  const [recept, setRecept] = useState(null);
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
      const response = await fetch('http://localhost:3001/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
          ingredients: ingredienten,
          request: gerecht,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecept(data);
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
            
            <div className="space-y-2">
              <Label htmlFor="gerecht">Wat wil je maken?</Label>
              <Input
                id="gerecht"
                value={gerecht}
                onChange={(e) => setGerecht(e.target.value)}
                placeholder="Bijvoorbeeld: curry, pasta, stir-fry, soep..."
                required
              />
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
