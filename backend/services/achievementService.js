const User = require('../models/User');

class AchievementService {
  constructor() {
    this.achievements = {
      // Beginner Achievements
      'first-recipe': {
        id: 'first-recipe',
        name: '👨‍🍳 Eerste Recept',
        description: 'Genereer je eerste recept',
        category: 'beginner',
        condition: (stats) => stats.recipesGenerated >= 1
      },
      'preferences-set': {
        id: 'preferences-set',
        name: '⚙️ Persoonlijk Touch',
        description: 'Stel je voorkeuren en allergieën in',
        category: 'beginner',
        condition: (stats) => stats.preferencesSet === true
      },
      'kitchen-setup': {
        id: 'kitchen-setup',
        name: '🏠 Keuken Klaar',
        description: 'Voeg keukenapparatuur toe aan je profiel',
        category: 'beginner',
        condition: (stats) => stats.kitchenSetup === true
      },
      'first-steps': {
        id: 'first-steps',
        name: '👣 Eerste Stappen',
        description: 'Voltooi 5 kookstappen',
        category: 'beginner',
        condition: (stats) => stats.stepsCompleted >= 5
      },

      // Cooking Achievements
      'recipe-master': {
        id: 'recipe-master',
        name: '🏆 Recept Meester',
        description: 'Genereer 10 recepten',
        category: 'cooking',
        condition: (stats) => stats.recipesGenerated >= 10
      },
      'speed-chef': {
        id: 'speed-chef',
        name: '⚡ Speed Chef',
        description: 'Voltooi 5 recepten onder de 15 minuten',
        category: 'cooking',
        condition: (stats) => stats.speedCookRecipes >= 5
      },
      'vegetarian-explorer': {
        id: 'vegetarian-explorer',
        name: '🥬 Groente Liefhebber',
        description: 'Maak 10 vegetarische recepten',
        category: 'cooking',
        condition: (stats) => stats.vegetarianRecipes >= 10
      },
      'world-chef': {
        id: 'world-chef',
        name: '🌍 Wereld Chef',
        description: 'Probeer 5 verschillende keukens',
        category: 'cooking',
        condition: (stats) => stats.cuisinesExplored.length >= 5
      },
      'perfect-timing': {
        id: 'perfect-timing',
        name: '⏰ Perfecte Timing',
        description: 'Voltooi 5 recepten op tijd',
        category: 'cooking',
        condition: (stats) => stats.perfectTimingCount >= 5
      },

      // Equipment Achievements  
      'burner-rookie': {
        id: 'burner-rookie',
        name: '🔥 Fornuis Rookie',
        description: 'Gebruik je eerste fornuis pit',
        category: 'equipment',
        condition: (stats) => stats.burnersUsed && stats.burnersUsed.length >= 1
      },
      'multi-tasker': {
        id: 'multi-tasker',
        name: '🎯 Multi-tasker',
        description: 'Gebruik 2 fornuis pitten tegelijk',
        category: 'equipment',
        condition: (stats) => stats.burnersUsed && stats.burnersUsed.length >= 2
      },
      'burner-master': {
        id: 'burner-master',
        name: '🔥 Fornuis Meester',
        description: 'Gebruik alle 4 fornuis pitten tegelijk',
        category: 'equipment',
        condition: (stats) => stats.fourBurnersUsed === true
      },
      'appliance-explorer': {
        id: 'appliance-explorer',
        name: '🔧 Apparaat Explorer',
        description: 'Gebruik 5 verschillende keukenapparaten',
        category: 'equipment',
        condition: (stats) => stats.appliancesUsed.length >= 5
      },

      // Advanced Achievements
      'master-chef': {
        id: 'master-chef',
        name: '👑 Master Chef',
        description: 'Voltooi 3 complexe recepten',
        category: 'advanced',
        condition: (stats) => stats.masterChefRecipes >= 3
      },
      'cooking-streak': {
        id: 'cooking-streak',
        name: '🔥 Kook Reeks',
        description: 'Kook 7 dagen achter elkaar',
        category: 'advanced',
        condition: (stats) => stats.longestStreak >= 7
      },
      'international-chef': {
        id: 'international-chef',
        name: '🛸 Internationale Chef',
        description: 'Maak 20 internationale recepten',
        category: 'advanced',
        condition: (stats) => stats.internationalRecipes >= 20
      },
      'step-champion': {
        id: 'step-champion',
        name: '🏃 Stappen Kampioen',
        description: 'Voltooi 100 kookstappen',
        category: 'advanced',
        condition: (stats) => stats.stepsCompleted >= 100
      },

      // Special Achievements
      'dedication': {
        id: 'dedication',
        name: '💪 Toewijding',
        description: 'Kook meer dan 10 uur in totaal',
        category: 'special',
        condition: (stats) => stats.totalCookingTime >= 600 // 10 hours
      },
      'recipe-collector': {
        id: 'recipe-collector',
        name: '📚 Recept Verzamelaar',
        description: 'Genereer 50 recepten',
        category: 'special',
        condition: (stats) => stats.recipesGenerated >= 50
      }
    };
  }

  // Check for new achievements
  async checkAchievements(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const stats = user.achievements?.stats || {};
      const unlockedIds = new Set(user.achievements?.unlockedAchievements?.map(a => a.id) || []);
      const newAchievements = [];

      // Check each achievement
      for (const [id, achievement] of Object.entries(this.achievements)) {
        if (!unlockedIds.has(id) && achievement.condition(stats)) {
          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            category: achievement.category,
            unlockedAt: new Date()
          });
        }
      }

      // Add new achievements to user
      if (newAchievements.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            'achievements.unlockedAchievements': { $each: newAchievements }
          }
        });
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Update user stats and check for achievements
  async updateStats(userId, updates) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      // Initialize achievements if not exists
      if (!user.achievements) {
        user.achievements = { unlockedAchievements: [], stats: {} };
      }

      // Update stats
      const stats = user.achievements.stats || {};
      
      // Apply updates
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'burnersUsed' && Array.isArray(value)) {
          // Handle Array for burners
          if (!stats.burnersUsed) stats.burnersUsed = [];
          value.forEach(burner => {
            if (!stats.burnersUsed.includes(burner)) {
              stats.burnersUsed.push(burner);
            }
          });
        } else if (key === 'appliancesUsed' || key === 'cuisinesExplored') {
          // Handle arrays
          if (!stats[key]) stats[key] = [];
          if (Array.isArray(value)) {
            value.forEach(item => {
              if (!stats[key].includes(item)) {
                stats[key].push(item);
              }
            });
          } else if (!stats[key].includes(value)) {
            stats[key].push(value);
          }
        } else if (typeof value === 'number' && typeof stats[key] === 'number') {
          // Handle increments
          stats[key] = (stats[key] || 0) + value;
        } else {
          // Handle direct assignments
          stats[key] = value;
        }
      }

      // Handle cooking streaks
      if (updates.recipesGenerated) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastCooking = stats.lastCookingDate ? new Date(stats.lastCookingDate) : null;
        if (lastCooking) lastCooking.setHours(0, 0, 0, 0);

        if (!lastCooking) {
          stats.currentStreak = 1;
        } else {
          const daysDiff = Math.floor((today - lastCooking) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            stats.currentStreak = (stats.currentStreak || 0) + 1;
          } else if (daysDiff > 1) {
            stats.currentStreak = 1;
          }
          // If daysDiff === 0, same day, no change needed
        }

        stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
        stats.lastCookingDate = new Date();
      }

      // Save updated stats
      user.achievements.stats = stats;
      await user.save();

      // Check for new achievements
      return await this.checkAchievements(userId);
    } catch (error) {
      console.error('Error updating stats:', error);
      return [];
    }
  }

  // Get user achievements
  async getUserAchievements(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return { unlocked: [], available: [] };

      const unlockedIds = new Set(user.achievements?.unlockedAchievements?.map(a => a.id) || []);
      const stats = user.achievements?.stats || {};
      
      const unlocked = user.achievements?.unlockedAchievements || [];
      const available = Object.values(this.achievements).filter(a => !unlockedIds.has(a.id));

      // Add progress info to available achievements
      const availableWithProgress = available.map(achievement => ({
        ...achievement,
        progress: this.getAchievementProgress(achievement, stats)
      }));

      return {
        unlocked: unlocked.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)),
        available: availableWithProgress,
        stats
      };
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return { unlocked: [], available: [], stats: {} };
    }
  }

  // Get progress for an achievement
  getAchievementProgress(achievement, stats) {
    const id = achievement.id;
    
    const progressMap = {
      'first-recipe': { current: stats.recipesGenerated || 0, target: 1 },
      'recipe-master': { current: stats.recipesGenerated || 0, target: 10 },
      'recipe-collector': { current: stats.recipesGenerated || 0, target: 50 },
      'first-steps': { current: stats.stepsCompleted || 0, target: 5 },
      'step-champion': { current: stats.stepsCompleted || 0, target: 100 },
      'speed-chef': { current: stats.speedCookRecipes || 0, target: 5 },
      'vegetarian-explorer': { current: stats.vegetarianRecipes || 0, target: 10 },
      'world-chef': { current: stats.cuisinesExplored?.length || 0, target: 5 },
      'perfect-timing': { current: stats.perfectTimingCount || 0, target: 5 },
      'burner-rookie': { current: stats.burnersUsed?.length || 0, target: 1 },
      'multi-tasker': { current: stats.burnersUsed?.length || 0, target: 2 },
      'appliance-explorer': { current: stats.appliancesUsed?.length || 0, target: 5 },
      'master-chef': { current: stats.masterChefRecipes || 0, target: 3 },
      'cooking-streak': { current: stats.longestStreak || 0, target: 7 },
      'international-chef': { current: stats.internationalRecipes || 0, target: 20 },
      'dedication': { current: Math.floor((stats.totalCookingTime || 0) / 60), target: 10 }, // hours
    };

    return progressMap[id] || { current: 0, target: 1 };
  }
}

module.exports = new AchievementService();