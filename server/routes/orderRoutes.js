const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// POST: Create new Purchase Order
router.post('/add', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: 'Purchase order created successfully!', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase order.' });
  }
});

// POST: WBS 3.3.3 Auto-Generate Purchase Orders for Low Stock Items
router.post('/auto-generate-low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', { $ifNull: ['$reorderThreshold', 5] }] }
    });

    if (lowStockItems.length === 0) {
      return res.status(200).json({ message: 'No low stock items require reordering.', createdOrders: [] });
    }

    const createdOrders = [];
    for (const item of lowStockItems) {
      // Reorder quantity default to 15 items minus current stock
      const reorderQty = Math.max(15 - item.quantity, 10);
      const totalAmount = reorderQty * item.price;

      const order = new Order({
        item: item._id,
        supplier: item.supplier,
        quantity: reorderQty,
        totalAmount: totalAmount,
        status: 'Pending'
      });
      await order.save();
      createdOrders.push(order);
    }

    res.status(201).json({
      message: `Successfully auto-generated ${createdOrders.length} restock Purchase Orders!`,
      createdOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to auto-generate purchase orders.' });
  }
});

// GET: Fetch all Purchase Orders with populated inventory & supplier data
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('item', 'itemName price quantity')
      .populate('supplier', 'companyName contactPerson')
      .sort({ orderDate: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase orders.' });
  }
});

// PUT: Update Order Status (Auto-increments stock when marked as "Received")
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found.' });

    if (status === 'Received' && order.status !== 'Received') {
      await Inventory.findByIdAndUpdate(order.item, {
        $inc: { quantity: order.quantity }
      });
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: `Order status updated to ${status}.`, order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

module.exports = router;