const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  preferences: {
    favoriteIngredients: [{
      type: String,
      trim: true
    }],
    dislikedIngredients: [{
      type: String,
      trim: true
    }],
    favoriteCuisines: [{
      type: String,
      enum: ['italiensk', 'aziatisch', 'frans', 'grieks', 'spaans', 'mexicaans', 'indisch', 'thai', 'japans', 'mediterraan', 'nederlands', 'amerikaans', 'midden-oosters', 'andere'],
      trim: true
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarisch', 'veganistisch', 'glutenvrij', 'lactosevrij', 'suikervrij', 'koolhydraatarm', 'halal', 'kosher', 'andere'],
      trim: true
    }],
    allergies: [{
      type: String,
      trim: true
    }],
    spiceLevel: {
      type: String,
      enum: ['mild', 'gemiddeld', 'pittig', 'zeer-pittig'],
      default: 'gemiddeld'
    },
    cookingTime: {
      type: String,
      enum: ['snel', 'gemiddeld', 'langzaam', 'geen-voorkeur'],
      default: 'geen-voorkeur'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  achievements: {
    unlockedAchievements: [{
      id: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now },
      name: String,
      description: String
    }],
    stats: {
      recipesGenerated: { type: Number, default: 0 },
      totalCookingTime: { type: Number, default: 0 }, // in minutes
      stepsCompleted: { type: Number, default: 0 },
      burnersUsed: [Number], // track which burners used
      appliancesUsed: [String], // track appliances used
      cuisinesExplored: [String], // track different cuisines tried
      preferencesSet: { type: Boolean, default: false },
      kitchenSetup: { type: Boolean, default: false },
      perfectTimingCount: { type: Number, default: 0 }, // recipes completed on time
      longestStreak: { type: Number, default: 0 }, // consecutive days cooking
      currentStreak: { type: Number, default: 0 },
      lastCookingDate: Date,
      fourBurnersUsed: { type: Boolean, default: false }, // all 4 burners at once
      masterChefRecipes: { type: Number, default: 0 }, // complex recipes
      speedCookRecipes: { type: Number, default: 0 }, // recipes under 15 mins
      vegetarianRecipes: { type: Number, default: 0 },
      internationalRecipes: { type: Number, default: 0 }
    }
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster username lookups
UserSchema.index({ username: 1 });

module.exports = mongoose.model('User', UserSchema);