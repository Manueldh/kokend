const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minuten
    default: null
  },
  temperature: {
    type: String, // bijvoorbeeld "180°C", "medium vuur"
    default: null
  },
  appliance: {
    type: String, // welk apparaat te gebruiken
    default: null
  },
  cookware: {
    type: String, // welke pan/schaal te gebruiken
    default: null
  },
  timer: {
    type: Boolean,
    default: false
  },
  tips: [String] // extra tips voor deze stap
});

const RecipeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  ingredients: [{
    name: String,
    amount: String,
    unit: String
  }],
  userIngredients: {
    type: String, // de originele input van de gebruiker
    required: true
  },
  userRequest: {
    type: String, // wat de gebruiker wilde maken
    required: true
  },
  steps: [StepSchema],
  totalTime: {
    type: Number, // totale kooktijd in minuten
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['makkelijk', 'gemiddeld', 'moeilijk'],
    default: 'gemiddeld'
  },
  servings: {
    type: Number,
    default: 2
  },
  kitchenRequirements: {
    appliances: [String],
    cookware: [String]
  },
  aiGenerated: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
