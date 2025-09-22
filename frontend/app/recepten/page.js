'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Utensils, Trash2, Eye } from "lucide-react";

export default function ReceptenPage() {
  const [recepten, setRecepten] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecepten();
  }, []);

  const fetchRecepten = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/recipes/user/demo-user');
      if (response.ok) {
        const data = await response.json();
        setRecepten(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/recipes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRecepten(recepten.filter(recept => recept._id !== id));
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'makkelijk': return 'bg-green-100 text-green-800';
      case 'gemiddeld': return 'bg-yellow-100 text-yellow-800';
      case 'moeilijk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Recepten laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Mijn Recepten</h1>
        <p className="text-xl text-gray-600">
          Alle door AI gegenereerde recepten op één plek
        </p>
      </div>

      {recepten.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nog geen recepten
            </h3>
            <p className="text-gray-500 mb-4">
              Genereer je eerste recept om hier te zien!
            </p>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <a href="/">Genereer Recept</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recepten.map((recept) => (
            <Card key={recept._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {recept.title}
                  </CardTitle>
                  <Badge className={getDifficultyColor(recept.difficulty)}>
                    {recept.difficulty}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  Ingrediënten: {recept.userIngredients}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{recept.totalTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{recept.servings} porties</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={`/recepten/${recept._id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijk
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteRecipe(recept._id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Gemaakt op {new Date(recept.createdAt).toLocaleDateString('nl-NL')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
