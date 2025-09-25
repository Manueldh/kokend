const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Kitchen = require('../models/Kitchen');
const OpenAIService = require('../services/openaiService');
const achievementService = require('../services/achievementService');

// POST - Genereer recept met AI
router.post('/generate', async (req, res) => {
  try {
    const { 
      userId, 
      ingredients, 
      request, 
      servings = 2, 
      onlyUseMyIngredients = true,
      allergies = [], // Nieuw: voor niet-ingelogde gebruikers
      guestPreferences = {} // Nieuw: voor gastvoorkeuren
    } = req.body;
    
    if (!ingredients || !request) {
      return res.status(400).json({ 
        message: 'ingredients en request zijn vereist' 
      });
    }

    // Haal gebruikersvoorkeuren op als ingelogd
    let userPreferences = null;
    if (userId) {
      const User = require('../models/User');
      const user = await User.findById(userId);
      userPreferences = user?.preferences || {};
    }

    // Combineer gebruikersvoorkeuren met gastvoorkeuren en allergieën
    const combinedPreferences = {
      ...userPreferences,
      ...guestPreferences,
      allergies: allergies // Voeg allergieën toe
    };

    // Haal keukeninformatie op (alleen voor ingelogde gebruikers)
    const kitchen = userId ? await Kitchen.findOne({ userId }) : null;
    
    // Initialiseer OpenAI service
    const openaiService = new OpenAIService();
    
    let recipeData;
    try {
      // Probeer AI recept te genereren met voorkeuren
      recipeData = await openaiService.generateRecipe(
        ingredients, 
        request, 
        kitchen, 
        servings, 
        onlyUseMyIngredients,
        combinedPreferences // Voeg voorkeuren toe aan AI call
      );
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      // Gebruik fallback als AI faalt
      recipeData = openaiService.createFallbackRecipe(ingredients, request, servings);
    }
    
    // Sla het gegenereerde recept alleen op voor ingelogde gebruikers
    if (userId) {
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

      // Update achievement stats for recipe generation
      const statsUpdate = {
        recipesGenerated: 1,
        totalCookingTime: recipeData.totalTime || 0
      };

      // Check recipe complexity
      if (recipeData.difficulty === 'moeilijk' || recipeData.totalTime > 60) {
        statsUpdate.masterChefRecipes = 1;
      }

      // Check speed cooking
      if (recipeData.totalTime <= 15) {
        statsUpdate.speedCookRecipes = 1;
      }

      // Check cuisine type (if available in recipe data)
      if (recipeData.cuisine && recipeData.cuisine !== 'nederlands') {
        statsUpdate.internationalRecipes = 1;
        statsUpdate.cuisinesExplored = [recipeData.cuisine];
      }

      // Check vegetarian
      const isVegetarian = recipeData.ingredients?.every(ing => 
        !['kip', 'rundvlees', 'varkensvlees', 'vis', 'zalm', 'tonijn', 'garnalen', 'ham', 'spek'].some(meat => 
          ing.name?.toLowerCase().includes(meat)
        )
      );
      if (isVegetarian) {
        statsUpdate.vegetarianRecipes = 1;
      }

      // Track appliances used
      const appliances = recipeData.steps?.map(step => step.appliance).filter(Boolean) || [];
      if (appliances.length > 0) {
        statsUpdate.appliancesUsed = [...new Set(appliances)];
      }

      // Update stats and check for new achievements
      const newAchievements = await achievementService.updateStats(userId, statsUpdate);
      
      // Include new achievements in response
      res.json({
        ...savedRecipe.toObject(),
        newAchievements
      });
    } else {
      // Voor gastgebruikers, stuur alleen de receptdata terug zonder op te slaan
      res.json({
        ...recipeData,
        _id: null, // Geen database ID
        createdAt: new Date(),
        aiGenerated: true,
        guestRecipe: true // Markeer als gastrecept
      });
    }
    
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
