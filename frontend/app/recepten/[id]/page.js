'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Utensils, ChefHat } from "lucide-react";
import { normalizeIngredient, ingredientMatches } from '@/lib/utils';
import DigitalStove from "@/components/DigitalStove";

export default function ReceptDetailPage({ params }) {
  const { id } = params;
  const [recept, setRecept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [ownedIngredients, setOwnedIngredients] = useState(new Set());

  // Shared burner state (mirror HomePage)
  const [burners, setBurners] = useState([
    { id: 1, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 2, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 3, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 4, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' }
  ]);

  useEffect(() => {
    const fetchRecept = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/recipes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecept(data);
          // initialize owned ingredients based on userIngredients and lenient matching
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
          console.error('Recipe not found');
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecept();
  }, [id]);

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Recept laden...</p>
      </div>
    );
  }

  if (!recept) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Recept niet gevonden</h2>
        <p className="text-gray-500">Het gevraagde recept bestaat niet of is verwijderd.</p>
        <div className="mt-4">
          <Link href="/recepten">
            <Button variant="outline">Terug naar recepten</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-orange-700">🍽️ {recept.title}</CardTitle>
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
            {/* Ingredients summary card */}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                <span>Stappenplan</span>
              </CardTitle>
              <CardDescription>Sleep stappen naar het digitaal fornuis voor de beste timing</CardDescription>
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
  );
}
