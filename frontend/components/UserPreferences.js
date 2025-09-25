'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Heart, AlertTriangle, Globe, Clock } from "lucide-react";
import { useUser } from "./UserProvider";
import { api } from "../lib/api";
import AchievementNotification from "./AchievementNotification";

export default function UserPreferences() {
  const { user, updateUser } = useUser();
  const [preferences, setPreferences] = useState({
    favoriteIngredients: [],
    dislikedIngredients: [],
    favoriteCuisines: [],
    dietaryRestrictions: [],
    allergies: [],
    spiceLevel: 'gemiddeld',
    cookingTime: 'geen-voorkeur'
  });
  
  const [newFavoriteIngredient, setNewFavoriteIngredient] = useState('');
  const [newDislikedIngredient, setNewDislikedIngredient] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newAchievements, setNewAchievements] = useState(null);

  const cuisineTypes = [
    'italiensk', 'aziatisch', 'frans', 'grieks', 'spaans', 'mexicaans',
    'indisch', 'thai', 'japans', 'mediterraan', 'nederlands', 'amerikaans',
    'midden-oosters', 'andere'
  ];

  const dietaryOptions = [
    'vegetarisch', 'veganistisch', 'glutenvrij', 'lactosevrij', 'suikervrij',
    'koolhydraatarm', 'halal', 'kosher', 'andere'
  ];

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        favoriteIngredients: user.preferences.favoriteIngredients || [],
        dislikedIngredients: user.preferences.dislikedIngredients || [],
        favoriteCuisines: user.preferences.favoriteCuisines || [],
        dietaryRestrictions: user.preferences.dietaryRestrictions || [],
        allergies: user.preferences.allergies || [],
        spiceLevel: user.preferences.spiceLevel || 'gemiddeld',
        cookingTime: user.preferences.cookingTime || 'geen-voorkeur'
      });
    }
  }, [user]);

  const addFavoriteIngredient = () => {
    if (newFavoriteIngredient.trim() && !preferences.favoriteIngredients.includes(newFavoriteIngredient.trim())) {
      setPreferences(prev => ({
        ...prev,
        favoriteIngredients: [...prev.favoriteIngredients, newFavoriteIngredient.trim()]
      }));
      setNewFavoriteIngredient('');
    }
  };

  const addDislikedIngredient = () => {
    if (newDislikedIngredient.trim() && !preferences.dislikedIngredients.includes(newDislikedIngredient.trim())) {
      setPreferences(prev => ({
        ...prev,
        dislikedIngredients: [...prev.dislikedIngredients, newDislikedIngredient.trim()]
      }));
      setNewDislikedIngredient('');
    }
  };

  const removeFavoriteIngredient = (ingredient) => {
    setPreferences(prev => ({
      ...prev,
      favoriteIngredients: prev.favoriteIngredients.filter(item => item !== ingredient)
    }));
  };

  const removeDislikedIngredient = (ingredient) => {
    setPreferences(prev => ({
      ...prev,
      dislikedIngredients: prev.dislikedIngredients.filter(item => item !== ingredient)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !preferences.allergies.includes(newAllergy.trim())) {
      setPreferences(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.filter(item => item !== allergy)
    }));
  };

  const toggleCuisine = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines.includes(cuisine)
        ? prev.favoriteCuisines.filter(item => item !== cuisine)
        : [...prev.favoriteCuisines, cuisine]
    }));
  };

  const toggleDietaryRestriction = (restriction) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(item => item !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.updateUserPreferences(user.id, preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Update user context with new preferences
      const updatedUser = {
        ...user,
        preferences: response.preferences || preferences
      };
      updateUser(updatedUser);
      
      // Check for new achievements
      if (response.newAchievements && response.newAchievements.length > 0) {
        setNewAchievements(response.newAchievements);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Favoriete Ingrediënten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Favoriete Ingrediënten
          </CardTitle>
          <CardDescription>
            Ingrediënten die je lekker vindt en graag in recepten ziet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newFavoriteIngredient}
              onChange={(e) => setNewFavoriteIngredient(e.target.value)}
              placeholder="Voeg een ingrediënt toe..."
              onKeyPress={(e) => e.key === 'Enter' && addFavoriteIngredient()}
            />
            <Button onClick={addFavoriteIngredient} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferences.favoriteIngredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                {ingredient}
                <button
                  onClick={() => removeFavoriteIngredient(ingredient)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ingrediënten om te vermijden */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Ingrediënten om te vermijden
          </CardTitle>
          <CardDescription>
            Ingrediënten die je niet lekker vindt (geen allergieën)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newDislikedIngredient}
              onChange={(e) => setNewDislikedIngredient(e.target.value)}
              placeholder="Voeg een ingrediënt toe om te vermijden..."
              onKeyPress={(e) => e.key === 'Enter' && addDislikedIngredient()}
            />
            <Button onClick={addDislikedIngredient} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferences.dislikedIngredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                {ingredient}
                <button
                  onClick={() => removeDislikedIngredient(ingredient)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favoriete Keukens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Favoriete Keukens
          </CardTitle>
          <CardDescription>
            Welke wereldkeukens vind je lekker?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {cuisineTypes.map((cuisine) => (
              <Button
                key={cuisine}
                variant={preferences.favoriteCuisines.includes(cuisine) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCuisine(cuisine)}
                className="justify-start"
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dieetbeperkingen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-purple-500" />
            Dieetbeperkingen
          </CardTitle>
          <CardDescription>
            Speciale dieetwensen (vegetarisch, glutenvrij, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {dietaryOptions.map((restriction) => (
              <Button
                key={restriction}
                variant={preferences.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDietaryRestriction(restriction)}
                className="justify-start"
              >
                {restriction}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allergieën */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Allergieën
          </CardTitle>
          <CardDescription>
            Voeg je allergieën toe zodat deze automatisch vermeden worden in recepten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="Bijvoorbeeld: noten, gluten, lactose..."
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
            />
            <Button onClick={addAllergy} size="sm" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferences.allergies.map((allergy, index) => (
              <Badge
                key={index}
                variant="destructive"
                className="flex items-center gap-1 px-3 py-1"
              >
                {allergy}
                <button
                  onClick={() => removeAllergy(allergy)}
                  className="ml-1 hover:bg-red-700 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          {preferences.allergies.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Nog geen allergieën toegevoegd. Voeg ze toe voor veiligere recepten.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Kruiden & Bereidingstijd */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kruidenniveau</CardTitle>
            <CardDescription>Hoe pittig vind je lekker?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={preferences.spiceLevel} 
              onValueChange={(value) => setPreferences(prev => ({...prev, spiceLevel: value}))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
                <SelectItem value="pittig">Pittig</SelectItem>
                <SelectItem value="zeer-pittig">Zeer pittig</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Bereidingstijd voorkeur
            </CardTitle>
            <CardDescription>Hoeveel tijd heb je meestal?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={preferences.cookingTime} 
              onValueChange={(value) => setPreferences(prev => ({...prev, cookingTime: value}))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snel">Snel (max 30 min)</SelectItem>
                <SelectItem value="gemiddeld">Gemiddeld (30-60 min)</SelectItem>
                <SelectItem value="langzaam">Langzaam (60+ min)</SelectItem>
                <SelectItem value="geen-voorkeur">Geen voorkeur</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Opslaan knop */}
      <div className="flex justify-end">
        <Button 
          onClick={savePreferences} 
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {loading ? 'Opslaan...' : saved ? '✓ Opgeslagen!' : 'Voorkeuren Opslaan'}
        </Button>
      </div>

      {/* Achievement Notification */}
      {newAchievements && (
        <AchievementNotification 
          achievements={newAchievements} 
          onClose={() => setNewAchievements(null)} 
        />
      )}
    </div>
  );
}