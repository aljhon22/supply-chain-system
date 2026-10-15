const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// POST: Add new supplier
router.post('/add', async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.status(201).json({ message: 'Supplier created successfully!', supplier: newSupplier });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier.' });
  }
});

// GET: Fetch all suppliers
router.get('/all', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers.' });
  }
});

// DELETE: Remove supplier by ID
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Supplier deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier.' });
  }
});

module.exports = router;