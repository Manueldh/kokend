const express = require('express');
const router = express.Router();
const User = require('../models/User');
const achievementService = require('../services/achievementService');

// Get user achievements
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await achievementService.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Manually trigger achievement check (for testing)
router.post('/check/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const newAchievements = await achievementService.checkAchievements(userId);
    res.json({ newAchievements });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

// Update user stats (internal endpoint)
router.post('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const newAchievements = await achievementService.updateStats(userId, updates);
    res.json({ newAchievements });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

module.exports = router;