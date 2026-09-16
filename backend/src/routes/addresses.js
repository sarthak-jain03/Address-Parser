const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { parseAddress, parseAddressesBatch } = require('../services/claudeParser');

router.post('/parse', async function (req, res) {
  try {
    var rawAddress = req.body.raw_address;
    if (!rawAddress || !rawAddress.trim()) {
      return res.status(400).json({ error: 'raw_address is required' });
    }
    var parsed = await parseAddress(rawAddress.trim());
    var address = await Address.create(parsed);
    res.status(201).json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse address', details: err.message });
  }
});

router.post('/parse-bulk', async function (req, res) {
  try {
    var addresses = req.body.addresses;
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'addresses array is required' });
    }
    var parsedResults = await parseAddressesBatch(addresses);
    var saved = await Address.insertMany(parsedResults);
    res.status(201).json({ success: true, count: saved.length, data: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse addresses', details: err.message });
  }
});

router.get('/stats', async function (req, res) {
  try {
    var total = await Address.countDocuments();
    var parsed = await Address.countDocuments({ status: 'parsed' });
    var unparseable = await Address.countDocuments({ status: 'unparseable' });
    var needsReview = await Address.countDocuments({ status: 'needs_review' });
    var recent = await Address.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: { total, parsed, unparseable, needsReview, recent }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats', details: err.message });
  }
});

router.get('/', async function (req, res) {
  try {
    var status = req.query.status;
    var search = req.query.search;
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 20;

    var filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { raw_address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } }
      ];
    }

    var skip = (page - 1) * limit;
    var total = await Address.countDocuments(filter);
    var addresses = await Address.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      success: true,
      data: addresses,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get addresses', details: err.message });
  }
});

router.get('/:id', async function (req, res) {
  try {
    var address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get address', details: err.message });
  }
});

router.put('/:id', async function (req, res) {
  try {
    var fields = ['house', 'street', 'locality', 'city', 'state', 'pincode', 'country', 'confidence', 'status', 'notes'];
    var updates = {};
    fields.forEach(function (f) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    var address = await Address.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update', details: err.message });
  }
});

router.delete('/:id', async function (req, res) {
  try {
    var address = await Address.findByIdAndDelete(req.params.id);
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete', details: err.message });
  }
});

module.exports = router;
