const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateRecipe(userIngredients, userRequest, kitchen = null) {
    try {
      // Bouw de prompt op basis van beschikbare informatie
      const prompt = this.buildRecipePrompt(userIngredients, userRequest, kitchen);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: "Je bent een ervaren Nederlandse chef-kok die persoonlijke recepten maakt. Antwoord altijd in het Nederlands en geef gestructureerde recepten terug in JSON formaat."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      });

      const responseText = completion.choices[0].message.content;
      
      // Probeer JSON te parsen uit de response
      const recipeData = this.parseRecipeResponse(responseText);
      
      return recipeData;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Fout bij genereren van recept met AI');
    }
  }

  buildRecipePrompt(userIngredients, userRequest, kitchen) {
    let prompt = `Maak een Nederlands recept voor "${userRequest}" met de volgende ingrediënten: ${userIngredients}\n\n`;
    
    // Voeg keukeninformatie toe als beschikbaar
    if (kitchen && kitchen.appliances && kitchen.appliances.length > 0) {
      const appliances = kitchen.appliances.map(a => `${a.name} (${a.type})`).join(', ');
      prompt += `Beschikbare apparaten: ${appliances}\n`;
    }
    
    if (kitchen && kitchen.cookware && kitchen.cookware.length > 0) {
      const cookware = kitchen.cookware.map(c => `${c.name} (${c.type})`).join(', ');
      prompt += `Beschikbaar kookgerei: ${cookware}\n`;
    }
    
    prompt += `
Geef het recept terug in dit exacte JSON formaat:
{
  "title": "Naam van het gerecht",
  "ingredients": [
    {"name": "ingrediënt naam", "amount": "hoeveelheid", "unit": "eenheid"}
  ],
  "steps": [
    {
      "stepNumber": 1,
      "description": "Uitgebreide beschrijving van de stap voor beginners",
      "duration": 10,
      "temperature": "180°C of medium vuur",
      "appliance": "oven/fornuis/magnetron etc",
      "cookware": "pan/ovenschaal etc",
      "burner": 1,
      "timer": true,
      "category": "prep/stove/oven/finish",
      "timerActions": [
        {
          "time": 2,
          "action": "Draai het vlees om voor gelijkmatige garing",
          "type": "instruction"
        },
        {
          "time": 5,
          "action": "Zet het vuur lager naar laag-medium",
          "type": "temperature_change"
        },
        {
          "time": 10,
          "action": "Stap voltooid - ga naar volgende stap",
          "type": "completion"
        }
      ],
      "tips": ["nuttige tip voor deze stap"],
      "difficulty": "beginner/intermediate/advanced"
    }
  ],
  "totalTime": 45,
  "difficulty": "makkelijk/gemiddeld/moeilijk",
  "servings": 2,
  "cookingSchedule": {
    "timeline": [
      {"time": 0, "action": "Start met voorbereiden", "steps": [1,2]},
      {"time": 5, "action": "Begin met koken op fornuis", "steps": [3]},
      {"time": 15, "action": "Voeg tweede gerecht toe", "steps": [4]}
    ],
    "parallelSteps": [[3,4], [5,6]],
    "criticalTiming": ["Zorg dat de pasta precies op tijd klaar is", "Saus pas op het laatste moment toevoegen"]
  },
  "kitchenRequirements": {
    "appliances": ["benodigde apparaten"],
    "cookware": ["benodigd kookgerei"]
  }
}

KRITIEKE INSTRUCTIES voor beginners:
1. STAP CATEGORIEËN:
   - "prep": Voorbereidingsstappen (snijden, mengen, etc.) - GEEN timers nodig
   - "stove": Fornuis stappen met timers - WEL naar fornuis slepen
   - "oven": Oven stappen met timers
   - "finish": Afwerking (garneren, serveren) - GEEN timers

2. INTELLIGENTE TIMING:
   - Geef duidelijke aanwijzingen WANNEER elke stap moet starten
   - Werk backwards van serving tijd
   - Pasta/rijst altijd pas starten als hoofdgerecht bijna klaar is
   - Vermeld expliciet: "Start dit 10 minuten NADAT je de kip hebt aangezet"

3. FORNUIS VERDELING:
   - Spreek logisch over de 4 pitten
   - Grote pot (pasta) = pit 1 of 4
   - Kleine pan (saus) = pit 2 of 3
   - Vermeld specifiek welke pit voor wat

4. BEGINNER HULP:
   - Leg uit WAAROM je iets doet
   - Vermeld visuele tekens (goudbruin, borrelt, sissend geluid)
   - Warn voor veelgemaakte fouten
   - Geef tijdsinschattingen voor elke handeling

5. TIMING COÖRDINATIE:
   - Maak duidelijk welke stappen tegelijk kunnen
   - Warn voor kritieke timing momenten
   - Geef buffer tijd voor beginners

Zorg ervoor dat het recept perfect werkt voor iemand die nog nooit heeft gekookt!`;

    return prompt;
  }

  parseRecipeResponse(responseText) {
    try {
      // Zoek naar JSON in de response (soms staat er extra tekst omheen)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Geen geldige JSON gevonden in AI response');
      }
      
      const recipeData = JSON.parse(jsonMatch[0]);
      
      // Valideer de basis structuur
      if (!recipeData.title || !recipeData.steps || !Array.isArray(recipeData.steps)) {
        throw new Error('Ongeldige recept structuur van AI');
      }
      
      // Voeg standaard waarden toe als ze ontbreken
      recipeData.totalTime = recipeData.totalTime || this.calculateTotalTime(recipeData.steps);
      recipeData.difficulty = recipeData.difficulty || 'gemiddeld';
      recipeData.servings = recipeData.servings || 2;
      recipeData.ingredients = recipeData.ingredients || [];
      recipeData.kitchenRequirements = recipeData.kitchenRequirements || {
        appliances: [],
        cookware: []
      };
      
      return recipeData;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Kon AI response niet verwerken');
    }
  }

  calculateTotalTime(steps) {
    return steps.reduce((total, step) => {
      return total + (step.duration || 0);
    }, 0);
  }

  // Fallback functie voor als OpenAI niet beschikbaar is
  createFallbackRecipe(userIngredients, userRequest) {
    return {
      title: `${userRequest} met beschikbare ingrediënten`,
      ingredients: [
        { name: "Hoofdingrediënt", amount: "naar smaak", unit: "" }
      ],
      steps: [
        {
          stepNumber: 1,
          description: `Bereid een heerlijk gerecht met: ${userIngredients}. Voor ${userRequest}.`,
          duration: 30,
          temperature: "medium vuur",
          appliance: "fornuis",
          cookware: "pan",
          burner: 1,
          timer: true,
          timerActions: [
            {
              time: 10,
              action: "Controleer de garing",
              type: "instruction"
            },
            {
              time: 20,
              action: "Roer voorzichtig om",
              type: "instruction"
            },
            {
              time: 30,
              action: "Stap voltooid - proef en kruid bij",
              type: "completion"
            }
          ],
          tips: ["AI service tijdelijk niet beschikbaar, probeer later opnieuw"]
        }
      ],
      totalTime: 30,
      difficulty: "gemiddeld",
      servings: 2,
      kitchenRequirements: {
        appliances: ["fornuis"],
        cookware: ["pan"]
      }
    };
  }
}

module.exports = OpenAIService;