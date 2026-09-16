const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Address = require('../models/Address');
const { parseAddress, parseAddressesBatch } = require('../services/claudeParser');

router.post('/parse', async (req, res) => {
  try {
    const { raw_address } = req.body;
    if (!raw_address || !raw_address.trim()) {
      return res.status(400).json({ error: 'raw_address is required' });
    }

    const parsedData = await parseAddress(raw_address.trim());
    const savedAddress = await Address.create(parsedData);
    res.status(201).json({ success: true, data: savedAddress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse address', details: err.message });
  }
});

router.post('/parse-bulk', async (req, res) => {
  try {
    const { addresses } = req.body;
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'addresses array is required' });
    }

    const parsedResults = await parseAddressesBatch(addresses);
    const savedAddresses = await Address.insertMany(parsedResults);
    res.status(201).json({ success: true, count: savedAddresses.length, data: savedAddresses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse addresses', details: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await Address.countDocuments();
    const parsed = await Address.countDocuments({ status: 'parsed' });
    const unparseable = await Address.countDocuments({ status: 'unparseable' });
    const needsReview = await Address.countDocuments({ status: 'needs_review' });
    const recent = await Address.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: { total, parsed, unparseable, needsReview, recent }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { raw_address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Address.countDocuments(query);
    const addresses = await Address.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: addresses,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ error: 'Address not found' });
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch address', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAddress) return res.status(404).json({ error: 'Address not found' });
    res.json({ success: true, data: updatedAddress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const deletedAddress = await Address.findByIdAndDelete(req.params.id);
    if (!deletedAddress) return res.status(404).json({ error: 'Address not found' });
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address', details: err.message });
  }
});

module.exports = router;
