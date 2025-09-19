const mongoose = require('mongoose');

const ApplianceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['fornuis', 'oven', 'magnetron', 'airfryer', 'grill', 'steamer', 'andere']
  },
  capacity: String, // bijvoorbeeld "4 pitten", "25L", etc.
  wattage: Number,
  settings: [String] // bijvoorbeeld ["hoog", "medium", "laag"] of temperaturen
});

const CookwareSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pan', 'braadpan', 'steelpan', 'wok', 'ovenschaal', 'bakvorm', 'andere']
  },
  size: String, // bijvoorbeeld "24cm", "2L", etc.
  material: {
    type: String,
    enum: ['roestvrij staal', 'anti-aanbak', 'gietijzer', 'keramiek', 'glas', 'andere']
  },
  ovenSafe: {
    type: Boolean,
    default: false
  },
  maxTemp: Number // maximale temperatuur
});

const KitchenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'Mijn Keuken'
  },
  appliances: [ApplianceSchema],
  cookware: [CookwareSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

KitchenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Kitchen', KitchenSchema);
