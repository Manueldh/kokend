'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function AchievementNotification({ achievements, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setIsVisible(true);
      
      // Auto-advance through achievements
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev < achievements.length - 1) {
            return prev + 1;
          } else {
            // All achievements shown, close after a delay
            setTimeout(() => {
              handleClose();
            }, 2000);
            return prev;
          }
        });
      }, 3000); // Show each achievement for 3 seconds

      return () => clearInterval(interval);
    }
  }, [achievements]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Match animation duration
  };

  if (!achievements || achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];
  if (!currentAchievement) return null;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'beginner':
        return 'from-green-500 to-emerald-600';
      case 'cooking':
        return 'from-blue-500 to-indigo-600';
      case 'equipment':
        return 'from-purple-500 to-violet-600';
      case 'advanced':
        return 'from-orange-500 to-amber-600';
      case 'special':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Card className={`max-w-md w-full mx-4 transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <CardContent className="p-0 relative overflow-hidden">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(currentAchievement.category)} opacity-10`}></div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          <div className="p-8 text-center relative">
            {/* Animated trophy */}
            <div className="relative mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getCategoryColor(currentAchievement.category)} flex items-center justify-center animate-bounce`}>
                <Trophy className="h-10 w-10 text-white" />
              </div>
              
              {/* Sparkles animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(6)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`absolute h-4 w-4 text-yellow-400 animate-ping`}
                    style={{
                      transform: `rotate(${i * 60}deg) translateY(-40px)`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Achievement content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  🎉 Achievement Behaald!
                </h2>
                <h3 className={`text-xl font-bold bg-gradient-to-r ${getCategoryColor(currentAchievement.category)} bg-clip-text text-transparent`}>
                  {currentAchievement.name}
                </h3>
                <p className="text-gray-600 text-base">
                  {currentAchievement.description}
                </p>
              </div>

              {/* Progress indicator for multiple achievements */}
              {achievements.length > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {achievements.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-orange-500 scale-125' 
                          : index < currentIndex 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Achievement count */}
              {achievements.length > 1 && (
                <p className="text-sm text-gray-500">
                  {currentIndex + 1} van {achievements.length} nieuwe achievements
                </p>
              )}
            </div>

            {/* Celebration confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}