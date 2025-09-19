const express = require('express');
const router = express.Router();
const Kitchen = require('../models/Kitchen');

// GET - Haal keuken op voor een gebruiker
router.get('/:userId', async (req, res) => {
  try {
    const kitchen = await Kitchen.findOne({ userId: req.params.userId });
    
    if (!kitchen) {
      return res.status(404).json({ message: 'Geen keuken gevonden voor deze gebruiker' });
    }
    
    res.json(kitchen);
  } catch (error) {
    res.status(500).json({ message: 'Server fout', error: error.message });
  }
});

// POST - Maak nieuwe keuken aan of update bestaande
router.post('/', async (req, res) => {
  try {
    const { userId, name, appliances, cookware } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is vereist' });
    }

    let kitchen = await Kitchen.findOne({ userId });
    
    if (kitchen) {
      // Update bestaande keuken
      kitchen.name = name || kitchen.name;
      kitchen.appliances = appliances || kitchen.appliances;
      kitchen.cookware = cookware || kitchen.cookware;
      kitchen.updatedAt = Date.now();
    } else {
      // Maak nieuwe keuken aan
      kitchen = new Kitchen({
        userId,
        name: name || 'Mijn Keuken',
        appliances: appliances || [],
        cookware: cookware || []
      });
    }
    
    const savedKitchen = await kitchen.save();
    res.status(201).json(savedKitchen);
  } catch (error) {
    res.status(400).json({ message: 'Fout bij opslaan keuken', error: error.message });
  }
});

// PUT - Voeg apparaat toe aan keuken
router.put('/:userId/appliance', async (req, res) => {
  try {
    const kitchen = await Kitchen.findOne({ userId: req.params.userId });
    
    if (!kitchen) {
      return res.status(404).json({ message: 'Keuken niet gevonden' });
    }
    
    kitchen.appliances.push(req.body);
    const savedKitchen = await kitchen.save();
    
    res.json(savedKitchen);
  } catch (error) {
    res.status(400).json({ message: 'Fout bij toevoegen apparaat', error: error.message });
  }
});

// PUT - Voeg kookgerei toe aan keuken
router.put('/:userId/cookware', async (req, res) => {
  try {
    const kitchen = await Kitchen.findOne({ userId: req.params.userId });
    
    if (!kitchen) {
      return res.status(404).json({ message: 'Keuken niet gevonden' });
    }
    
    kitchen.cookware.push(req.body);
    const savedKitchen = await kitchen.save();
    
    res.json(savedKitchen);
  } catch (error) {
    res.status(400).json({ message: 'Fout bij toevoegen kookgerei', error: error.message });
  }
});

// DELETE - Verwijder apparaat uit keuken
router.delete('/:userId/appliance/:applianceId', async (req, res) => {
  try {
    const kitchen = await Kitchen.findOne({ userId: req.params.userId });
    
    if (!kitchen) {
      return res.status(404).json({ message: 'Keuken niet gevonden' });
    }
    
    kitchen.appliances = kitchen.appliances.filter(
      appliance => appliance._id.toString() !== req.params.applianceId
    );
    
    const savedKitchen = await kitchen.save();
    res.json(savedKitchen);
  } catch (error) {
    res.status(400).json({ message: 'Fout bij verwijderen apparaat', error: error.message });
  }
});

module.exports = router;
