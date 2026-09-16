const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  raw_address: { type: String, required: true, trim: true },
  house: { type: String, default: null },
  street: { type: String, default: null },
  locality: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  pincode: { type: String, default: null },
  country: { type: String, default: 'India' },
  confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
  status: { type: String, enum: ['parsed', 'unparseable', 'needs_review'], default: 'needs_review' },
  notes: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
