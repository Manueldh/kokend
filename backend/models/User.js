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
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster username lookups
UserSchema.index({ username: 1 });

module.exports = mongoose.model('User', UserSchema);