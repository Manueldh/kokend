'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Lock, Zap, CheckCircle, Clock, Target } from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { apiUrl } from '../../lib/api';

export default function AchievementsPage() {
  const { user } = useUser();
  const [achievements, setAchievements] = useState({ unlocked: [], available: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(apiUrl(`/api/achievements/user/${user.id}`));
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Je moet ingelogd zijn om je achievements te bekijken.</p>
            <a href="/login" className="text-blue-600 hover:underline">Log hier in</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Achievements laden...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'beginner':
        return <Star className="h-5 w-5 text-green-500" />;
      case 'cooking':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'equipment':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'advanced':
        return <Trophy className="h-5 w-5 text-orange-500" />;
      case 'special':
        return <CheckCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cooking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'equipment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'special':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getProgressPercentage = (progress) => {
    if (!progress) return 0;
    return Math.min(100, Math.round((progress.current / progress.target) * 100));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-3">
          <Trophy className="h-12 w-12 text-yellow-600" />
          <h1 className="text-4xl font-bold text-gray-800">Achievements</h1>
        </div>
        <p className="text-xl text-gray-600">
          Jouw kookprestaties en behaalde mijlpalen
        </p>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Jouw Kook Statistieken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{achievements.stats.recipesGenerated || 0}</div>
              <div className="text-sm text-gray-600">Recepten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{achievements.stats.stepsCompleted || 0}</div>
              <div className="text-sm text-gray-600">Stappen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.floor((achievements.stats.totalCookingTime || 0) / 60)}h {(achievements.stats.totalCookingTime || 0) % 60}m</div>
              <div className="text-sm text-gray-600">Kooktijd</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{achievements.unlocked.length}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {achievements.unlocked.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Behaalde Achievements ({achievements.unlocked.length})</span>
            </CardTitle>
            <CardDescription>
              Gefeliciteerd met deze prestaties!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.unlocked.map((achievement) => (
                <Card key={achievement.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getCategoryIcon(achievement.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-green-800">{achievement.name}</h3>
                          <Badge className="bg-green-200 text-green-800">
                            Behaald
                          </Badge>
                        </div>
                        <p className="text-sm text-green-700 mb-2">{achievement.description}</p>
                        <p className="text-xs text-green-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Behaald op {formatDate(achievement.unlockedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Achievements by Category */}
      {['beginner', 'cooking', 'equipment', 'advanced', 'special'].map((category) => {
        const categoryAchievements = achievements.available.filter(a => a.category === category);
        
        if (categoryAchievements.length === 0) return null;

        const categoryNames = {
          beginner: 'Beginner',
          cooking: 'Koken',
          equipment: 'Apparatuur',
          advanced: 'Gevorderd',
          special: 'Speciaal'
        };

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getCategoryIcon(category)}
                <span>{categoryNames[category]} Achievements</span>
                <Badge variant="outline">{categoryAchievements.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryAchievements.map((achievement) => {
                  const progress = achievement.progress || { current: 0, target: 1 };
                  const percentage = getProgressPercentage(progress);
                  
                  return (
                    <Card key={achievement.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl opacity-50">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-bold text-gray-700">{achievement.name}</h3>
                              <Badge className={getCategoryColor(category)}>
                                {categoryNames[category]}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Voortgang</span>
                                <span>{progress.current}/{progress.target}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 text-right">
                                {percentage}% voltooid
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* No achievements message */}
      {achievements.unlocked.length === 0 && achievements.available.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nog geen achievements</h3>
            <p className="text-gray-500">Begin met koken om je eerste achievements te verdienen!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}