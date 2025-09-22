const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Kitchen = require('../models/Kitchen');
const OpenAIService = require('../services/openaiService');

// POST - Genereer recept met AI
router.post('/generate', async (req, res) => {
  try {
    const { userId, ingredients, request, servings = 2, onlyUseMyIngredients = true } = req.body;
    
    if (!userId || !ingredients || !request) {
      return res.status(400).json({ 
        message: 'userId, ingredients en request zijn vereist' 
      });
    }

    // Haal keukeninformatie op
    const kitchen = await Kitchen.findOne({ userId });
    
    // Initialiseer OpenAI service
    const openaiService = new OpenAIService();
    
    let recipeData;
    try {
      // Probeer AI recept te genereren
      recipeData = await openaiService.generateRecipe(ingredients, request, kitchen, servings, onlyUseMyIngredients);
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      // Gebruik fallback als AI faalt
      recipeData = openaiService.createFallbackRecipe(ingredients, request, servings);
    }
    
    // Sla het gegenereerde recept op
    const recipe = new Recipe({
      userId,
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      userIngredients: ingredients,
      userRequest: request,
      steps: recipeData.steps,
      totalTime: recipeData.totalTime,
      difficulty: recipeData.difficulty,
  servings: recipeData.servings,
      kitchenRequirements: recipeData.kitchenRequirements,
      aiGenerated: true
    });
    
    const savedRecipe = await recipe.save();
    res.json(savedRecipe);
    
  } catch (error) {
    console.error('Recipe generation error:', error);
    res.status(500).json({ 
      message: 'Fout bij genereren recept', 
      error: error.message 
    });
  }
});

// GET - Haal alle recepten van een gebruiker op
router.get('/user/:userId', async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Server fout', error: error.message });
  }
});

// GET - Haal specifiek recept op
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recept niet gevonden' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Server fout', error: error.message });
  }
});

// DELETE - Verwijder recept
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recept niet gevonden' });
    }
    
    res.json({ message: 'Recept verwijderd' });
  } catch (error) {
    res.status(500).json({ message: 'Server fout', error: error.message });
  }
});

module.exports = router;
