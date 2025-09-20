'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, RotateCcw, Flame, ThermometerSun, ChefHat, Clock } from "lucide-react";

const BURNER_COLORS = {
  off: 'bg-gray-300',
  low: 'bg-blue-400',
  medium: 'bg-orange-400', 
  high: 'bg-red-500'
};

const BURNER_INTENSITIES = {
  off: 'opacity-30',
  low: 'opacity-60 animate-pulse',
  medium: 'opacity-80 animate-pulse',
  high: 'opacity-100 animate-pulse'
};

export default function DigitalStove({ recipe, onStepComplete, showSteps = true, showStoveInterface = true, burners, setBurners }) {
  // Use prop burners if provided, otherwise use internal state
  const [internalBurners, setInternalBurners] = useState([
    { id: 1, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 2, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 3, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' },
    { id: 4, active: false, step: null, timer: 0, totalTime: 0, currentAction: null, intensity: 'off', cookware: '' }
  ]);

  const actualBurners = burners || internalBurners;
  const setActualBurners = setBurners || setInternalBurners;

  const [notifications, setNotifications] = useState([]);
  const [globalTimer, setGlobalTimer] = useState(0);
  const [cookingStarted, setCookingStarted] = useState(false);
  const [nextSuggestion, setNextSuggestion] = useState(null);
  const intervalRefs = useRef({});
  const audioRef = useRef(null);
  const globalTimerRef = useRef(null);

  useEffect(() => {
    // Cleanup intervals when component unmounts
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    };
  }, []);

  // Start global cooking timer when first burner starts
  useEffect(() => {
    const activeBurners = actualBurners.filter(b => b.active);
    if (activeBurners.length > 0 && !cookingStarted) {
      setCookingStarted(true);
      startGlobalTimer();
    } else if (activeBurners.length === 0 && cookingStarted) {
      // All burners stopped, check for next suggestion
      updateNextSuggestion();
    }
  }, [actualBurners, cookingStarted]);

  const startGlobalTimer = () => {
    globalTimerRef.current = setInterval(() => {
      setGlobalTimer(prev => {
        const newTime = prev + 1;
        // Check for timed suggestions every 30 seconds
        if (newTime % 30 === 0) {
          updateNextSuggestion();
        }
        return newTime;
      });
    }, 1000);
  };

  const updateNextSuggestion = () => {
    if (!recipe?.steps) return;
    
    const availableSteps = getAvailableSteps();
    const activeBurners = actualBurners.filter(b => b.active);
    
    if (availableSteps.length === 0) {
      setNextSuggestion(null);
      return;
    }

    // Find the next logical step based on timing
    const nextStep = availableSteps.find(step => {
      const description = step.description.toLowerCase();
      
      // Suggest pasta/rice when something is already cooking
      if (activeBurners.length > 0 && (description.includes('pasta') || description.includes('rijst'))) {
        return true;
      }
      
      // Suggest sauce when main ingredient is halfway done
      const mainBurner = activeBurners.find(b => {
        const mainDesc = b.step?.description?.toLowerCase() || '';
        return mainDesc.includes('vlees') || mainDesc.includes('kip') || mainDesc.includes('vis');
      });
      
      if (mainBurner && description.includes('saus')) {
        const progress = mainBurner.timer / mainBurner.totalTime;
        if (progress > 0.4) return true;
      }
      
      return false;
    });

    if (nextStep) {
      setNextSuggestion({
        step: nextStep,
        reason: getStepSuggestionReason(nextStep, activeBurners)
      });
    } else {
      setNextSuggestion(null);
    }
  };

  const getStepSuggestionReason = (step, activeBurners) => {
    const description = step.description.toLowerCase();
    
    if (description.includes('pasta') || description.includes('rijst')) {
      return `Perfect timing! Start nu de ${description.includes('pasta') ? 'pasta' : 'rijst'} terwijl de andere ingrediënten koken.`;
    }
    
    if (description.includes('saus')) {
      const mainIngredient = activeBurners[0]?.step?.description || 'hoofdgerecht';
      return `Tijd voor de saus! De ${mainIngredient} is bijna klaar.`;
    }
    
    return `Volgende stap: bereid dit voor terwijl je andere gerechten koken.`;
  };

  const getIntensityFromTemperature = (temperature) => {
    if (!temperature) return 'off';
    const temp = temperature.toLowerCase();
    if (temp.includes('laag') || temp.includes('low')) return 'low';
    if (temp.includes('hoog') || temp.includes('high')) return 'high';
    if (temp.includes('medium') || temp.includes('gemiddeld')) return 'medium';
    return 'medium';
  };

  const startTimer = (burnerId, step) => {
    const burner = actualBurners.find(b => b.id === burnerId);
    if (burner.active) return; // Al actief

    const intensity = getIntensityFromTemperature(step.temperature);
    
    setActualBurners(prev => {
      const newBurners = prev.map(b => 
        b.id === burnerId 
          ? { 
              ...b, 
              active: true, 
              step, 
              timer: 0, 
              totalTime: step.duration * 60, // Convert to seconds
              intensity,
              cookware: step.cookware || '',
              currentAction: step.timerActions?.[0] || null
            }
          : b
      );
      return newBurners;
    });

    // Start interval for this burner
    intervalRefs.current[burnerId] = setInterval(() => {
      setActualBurners(prev => prev.map(b => {
        if (b.id !== burnerId || !b.active) return b;

        const newTimer = b.timer + 1;
        const newBurner = { ...b, timer: newTimer };

        // Check for timer actions
        if (b.step.timerActions) {
          const currentAction = b.step.timerActions.find(action => 
            action.time * 60 === newTimer
          );
          
          if (currentAction) {
            showNotification(burnerId, currentAction, b.step);
            
            // Update temperature if it's a temperature change
            if (currentAction.type === 'temperature_change') {
              newBurner.intensity = getIntensityFromTemperature(currentAction.action);
            }
            
            // Complete step if it's completion
            if (currentAction.type === 'completion') {
              stopTimer(burnerId);
              onStepComplete?.(b.step.stepNumber);
            }
          }
        }

        // Auto-complete when time is up
        if (newTimer >= b.totalTime) {
          stopTimer(burnerId);
          onStepComplete?.(b.step.stepNumber);
          showNotification(burnerId, { 
            action: `${b.step.description} is klaar!`, 
            type: 'completion' 
          }, b.step);
        }

        return newBurner;
      }));
    }, 1000);
  };

  const stopTimer = (burnerId) => {
    if (intervalRefs.current[burnerId]) {
      clearInterval(intervalRefs.current[burnerId]);
      delete intervalRefs.current[burnerId];
    }

    setActualBurners(prev => prev.map(b => 
      b.id === burnerId 
        ? { ...b, active: false, timer: 0, step: null, intensity: 'off', cookware: '', currentAction: null }
        : b
    ));
  };

  const pauseTimer = (burnerId) => {
    if (intervalRefs.current[burnerId]) {
      clearInterval(intervalRefs.current[burnerId]);
      delete intervalRefs.current[burnerId];
    }

    setActualBurners(prev => prev.map(b => 
      b.id === burnerId ? { ...b, active: false, intensity: 'off' } : b
    ));
  };

  const resumeTimer = (burnerId) => {
    const burner = actualBurners.find(b => b.id === burnerId);
    if (!burner.step) return;

    setActualBurners(prev => prev.map(b => 
      b.id === burnerId 
        ? { ...b, active: true, intensity: getIntensityFromTemperature(b.step.temperature) }
        : b
    ));

    // Resume interval
    intervalRefs.current[burnerId] = setInterval(() => {
      setActualBurners(prev => prev.map(b => {
        if (b.id !== burnerId || !b.active) return b;

        const newTimer = b.timer + 1;
        
        // Timer logic (same as startTimer)
        if (newTimer >= b.totalTime) {
          stopTimer(burnerId);
          onStepComplete?.(b.step.stepNumber);
        }

        return { ...b, timer: newTimer };
      }));
    }, 1000);
  };

  const resetTimer = (burnerId) => {
    stopTimer(burnerId);
  };

  const showNotification = (burnerId, action, step) => {
    const notification = {
      id: Date.now(),
      burnerId,
      action: action.action,
      type: action.type,
      stepNumber: step.stepNumber,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {}); // Ignore if autoplay blocked
    }

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(`Fornuis Pit ${burnerId}`, {
        body: action.action,
        icon: '/favicon.ico'
      });
    }

    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 10000);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableSteps = () => {
    if (!recipe?.steps) return [];
    
    const usedSteps = actualBurners.filter(b => b.step).map(b => b.step.stepNumber);
    return recipe.steps.filter(step => 
      !usedSteps.includes(step.stepNumber)
    );
  };

  const getAllSteps = () => {
    if (!recipe?.steps) return [];
    return recipe.steps;
  };

  const getUsedSteps = () => {
    if (!recipe?.steps) return [];
    
    const usedSteps = actualBurners.filter(b => b.step).map(b => b.step.stepNumber);
    return recipe.steps.filter(step => 
      usedSteps.includes(step.stepNumber)
    );
  };

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Global Timer and Smart Suggestions - Only when showing stove interface */}
      {showStoveInterface && cookingStarted && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Totale kooktijd</span>
              </div>
              <Badge variant="outline" className="bg-white text-blue-800 border-blue-200">
                {formatTime(globalTimer)}
              </Badge>
            </div>
            
            {nextSuggestion && (
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-start space-x-2">
                  <ChefHat className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-800 mb-1">Slimme suggestie</div>
                    <div className="text-sm text-blue-700 mb-2">{nextSuggestion.reason}</div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Stap {nextSuggestion.step.stepNumber}:</strong> {nextSuggestion.step.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border-l-4 ${
                notification.type === 'completion' ? 'bg-green-50 border-green-500' :
                notification.type === 'temperature_change' ? 'bg-orange-50 border-orange-500' :
                'bg-blue-50 border-blue-500'
              } animate-pulse`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm">
                    Pit {notification.burnerId} - Stap {notification.stepNumber}
                  </div>
                  <div className="text-sm">{notification.action}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Stove Interface - Only show when showStoveInterface is true */}
      {showStoveInterface && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <span>Digitaal Fornuis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stove Top - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6 bg-gray-800 p-3 md:p-6 rounded-xl">
              {actualBurners.map(burner => (
                <div key={burner.id} className="text-center">
                  {/* Burner Circle */}
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center
                    ${BURNER_COLORS[burner.intensity]} ${BURNER_INTENSITIES[burner.intensity]}
                    border-4 border-gray-600 relative
                  `}>
                    <div className="text-white font-bold text-sm md:text-lg">{burner.id}</div>
                    
                    {/* Flame effect */}
                    {burner.active && burner.intensity !== 'off' && (
                      <div className="absolute inset-0 rounded-full">
                        <Flame className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          ${burner.intensity === 'high' ? 'h-5 w-5 md:h-6 md:w-6 text-red-300' :
                            burner.intensity === 'medium' ? 'h-4 w-4 md:h-5 md:w-5 text-orange-300' :
                            'h-3 w-3 md:h-4 md:w-4 text-blue-300'
                          } animate-pulse`} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Burner Info */}
                  <div className="text-white text-xs min-h-12 md:min-h-16">
                    {burner.step ? (
                      <>
                        <div className="font-semibold mb-1">
                          Stap {burner.step.stepNumber}
                        </div>
                        <div className="mb-1 truncate">{burner.cookware}</div>
                        <div className="text-orange-300 font-mono text-xs">
                          {formatTime(burner.timer)} / {formatTime(burner.totalTime)}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400 text-xs">Beschikbaar</div>
                    )}
                  </div>

                  {/* Burner Controls */}
                  <div className="flex justify-center space-x-1 mt-1 md:mt-2">
                    {burner.step && !burner.active && (
                      <Button size="sm" variant="secondary" onClick={() => resumeTimer(burner.id)} className="w-6 h-6 md:w-8 md:h-8 p-0">
                        <Play className="h-2 w-2 md:h-3 md:w-3" />
                      </Button>
                    )}
                    {burner.active && (
                      <Button size="sm" variant="secondary" onClick={() => pauseTimer(burner.id)} className="w-6 h-6 md:w-8 md:h-8 p-0">
                        <Pause className="h-2 w-2 md:h-3 md:w-3" />
                      </Button>
                    )}
                    {burner.step && (
                      <>
                        <Button size="sm" variant="destructive" onClick={() => resetTimer(burner.id)} className="w-6 h-6 md:w-8 md:h-8 p-0">
                          <Square className="h-2 w-2 md:h-3 md:w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps Section - Only show when showSteps is true */}
      {showSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="h-3 w-3 md:h-4 md:w-4" />
              <span>Alle receptstappen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {getAllSteps().map(step => {
                const burnerWithStep = actualBurners.find(b => b.step?.stepNumber === step.stepNumber);
                const isInUse = !!burnerWithStep;
                
                return (
                  <div key={step.stepNumber} className={`border rounded-lg p-3 md:p-4 ${
                    isInUse ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="font-medium text-sm md:text-base">Stap {step.stepNumber}</div>
                        {isInUse && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            Op pit {burnerWithStep.id}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 leading-relaxed mb-3">
                        {step.description}
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 flex-wrap mb-3">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          <Clock className="h-2 w-2 md:h-3 md:w-3 mr-1 flex-shrink-0" />
                          {step.duration} min
                        </Badge>
                        {step.temperature && (
                          <Badge variant="outline" className="text-xs whitespace-nowrap min-w-fit">
                            <ThermometerSun className="h-2 w-2 md:h-3 md:w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{step.temperature}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {!isInUse && (
                      <div className="flex justify-center">
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4].map(burnerId => {
                            const burner = actualBurners.find(b => b.id === burnerId);
                            const available = !burner.step;
                            return (
                              <Button
                                key={burnerId}
                                size="sm"
                                variant={available ? "default" : "secondary"}
                                disabled={!available}
                                onClick={() => available && startTimer(burnerId, step)}
                                className="w-8 h-8 md:w-10 md:h-10 p-0 text-xs rounded-md border-2"
                                style={{
                                  borderRadius: '6px',
                                  aspectRatio: '1'
                                }}
                              >
                                {burnerId}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {isInUse && burnerWithStep && (
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-blue-800 font-medium">
                            Actief op pit {burnerWithStep.id}
                          </div>
                          <div className="text-sm font-mono text-blue-600">
                            {formatTime(burnerWithStep.timer)} / {formatTime(burnerWithStep.totalTime)}
                          </div>
                        </div>
                        {burnerWithStep.active && (
                          <div className="mt-2 flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-700">Timer loopt</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRvoBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdIBAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4" type="audio/wav" />
      </audio>
    </div>
  );
}