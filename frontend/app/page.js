'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChefHat, Clock, Users, Utensils, Lightbulb, Timer } from "lucide-react";

export default function HomePage() {
  const [ingredienten, setIngredienten] = useState('');
  const [gerecht, setGerecht] = useState('');
  const [recept, setRecept] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-3">
          <ChefHat className="h-12 w-12 text-orange-600" />
          <h1 className="text-5xl font-bold text-gray-800">Kokend</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Je persoonlijke AI kook-assistent. Vertel welke ingrediënten je hebt en wat je wilt maken, 
          en krijg een stappenplan met timers terug!
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
            Vul je ingrediënten en gewenste gerecht in om een persoonlijk recept te krijgen
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
                  AI denkt na...
                </>
              ) : (
                <>
                  <ChefHat className="h-4 w-4 mr-2" />
                  Genereer Recept
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recipe Result */}
      {recept && (
        <div className="space-y-6">
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

          {/* Recipe Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                <span>Stappenplan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recept.steps?.map((step, index) => (
                  <div key={index} className="border-l-4 border-orange-500 bg-orange-50/50 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">
                        Stap {step.stepNumber}
                      </h4>
                      {step.timer && step.duration && (
                        <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
                          <Timer className="h-3 w-3" />
                          <span>{step.duration} min</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{step.description}</p>
                    
                    {/* Step Details */}
                    <div className="space-y-1 text-sm text-gray-600">
                      {step.temperature && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">🌡️ Temperatuur:</span>
                          <span>{step.temperature}</span>
                        </div>
                      )}
                      {step.appliance && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">🔧 Apparaat:</span>
                          <span>{step.appliance}</span>
                        </div>
                      )}
                      {step.cookware && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">🍳 Benodigdheden:</span>
                          <span>{step.cookware}</span>
                        </div>
                      )}
                    </div>

                    {/* Tips */}
                    {step.tips && step.tips.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-blue-800">Tips:</span>
                            <ul className="list-disc list-inside text-blue-700 text-sm mt-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
