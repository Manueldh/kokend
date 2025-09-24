const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple login with username only
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: 'Gebruikersnaam moet minimaal 2 karakters zijn' });
    }
    
    const cleanUsername = username.trim().toLowerCase();
    
    // Find or create user
    let user = await User.findOne({ username: cleanUsername });
    
    if (!user) {
      user = new User({ 
        username: cleanUsername,
        displayName: username.trim()
      });
      await user.save();
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het inloggen' });
  }
});

// Get current user info
router.get('/me/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      preferences: user.preferences || {}
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden' });
  }
});

// Update user preferences
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }
    
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
    
    await user.save();
    
    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Fout bij updaten voorkeuren' });
  }
});

module.exports = router;