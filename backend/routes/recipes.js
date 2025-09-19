const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Kitchen = require('../models/Kitchen');

// POST - Genereer recept met AI (placeholder voor nu)
router.post('/generate', async (req, res) => {
  try {
    const { userId, ingredients, request } = req.body;
    
    if (!userId || !ingredients || !request) {
      return res.status(400).json({ 
        message: 'userId, ingredients en request zijn vereist' 
      });
    }

    // Haal keukeninformatie op
    const kitchen = await Kitchen.findOne({ userId });
    
    // Voor nu maken we een mock recept - later vervang je dit met echte AI
    const mockRecipe = await generateMockRecipe(userId, ingredients, request, kitchen);
    
    res.json(mockRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij genereren recept', error: error.message });
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

// Mock functie voor recept generatie - vervang later met echte AI
async function generateMockRecipe(userId, ingredients, request, kitchen) {
  const mockSteps = [
    {
      stepNumber: 1,
      description: `Verwarm de ${kitchen?.appliances?.find(a => a.type === 'oven')?.name || 'oven'} voor op 180°C`,
      duration: 10,
      temperature: '180°C',
      appliance: 'oven',
      timer: true,
      tips: ['Zorg dat de oven goed is voorverwarmd voor het beste resultaat']
    },
    {
      stepNumber: 2,
      description: `Bereid de ingrediënten voor: ${ingredients}`,
      duration: 5,
      cookware: 'snijplank',
      tips: ['Snij alles in gelijke stukken voor gelijkmatige garing']
    },
    {
      stepNumber: 3,
      description: `Begin met koken volgens je verzoek: ${request}`,
      duration: 20,
      temperature: 'medium vuur',
      appliance: 'fornuis',
      cookware: 'pan',
      timer: true,
      tips: ['Roer regelmatig om aanbranden te voorkomen']
    }
  ];

  const recipe = new Recipe({
    userId,
    title: `Gerecht met ${ingredients.split(',')[0]}`,
    userIngredients: ingredients,
    userRequest: request,
    steps: mockSteps,
    totalTime: mockSteps.reduce((total, step) => total + (step.duration || 0), 0),
    difficulty: 'gemiddeld',
    servings: 2,
    kitchenRequirements: {
      appliances: ['oven', 'fornuis'],
      cookware: ['pan', 'snijplank']
    }
  });

  return await recipe.save();
}

module.exports = router;
