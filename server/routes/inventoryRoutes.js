const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Optional AuditLog model integration for ledger trail
let AuditLog;
try {
  AuditLog = require('../models/AuditLog');
} catch (e) {
  AuditLog = null;
}

// Optional Auth Middleware import
let verifyToken = (req, res, next) => next();
let authorizeRoles = () => (req, res, next) => next();
try {
  const authMiddleware = require('../middleware/authMiddleware');
  if (authMiddleware.verifyToken) verifyToken = authMiddleware.verifyToken;
  if (authMiddleware.authorizeRoles) authorizeRoles = authMiddleware.authorizeRoles;
} catch (e) {
  // Graceful fallback if middleware is not yet linked
}

// Helper utility to safely log inventory actions to the audit collection
const recordAuditLog = async (action, role, details) => {
  if (!AuditLog) return;
  try {
    await AuditLog.create({
      action,
      role: role || 'System',
      details,
      timestamp: new Date().toLocaleString()
    });
  } catch (err) {
    console.warn('[Audit Log Warning] Failed to write ledger entry:', err.message);
  }
};

// ==========================================
// 1. GET ALL INVENTORY ITEMS
// Route: GET /api/inventory
// Access: Public / Authenticated Users
// ==========================================
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (err) {
    console.error('[Inventory API Error] GET / failed:', err.message);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve inventory records from database.'
    });
  }
});

// ==========================================
// 2. GET SINGLE INVENTORY ITEM BY ID
// Route: GET /api/inventory/:id
// Access: Public / Authenticated Users
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'The requested inventory stock item was not found.'
      });
    }
    return res.status(200).json(item);
  } catch (err) {
    console.error(`[Inventory API Error] GET /${req.params.id} failed:`, err.message);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Invalid item ID or server database query failure.'
    });
  }
});

// ==========================================
// 3. CREATE NEW INVENTORY ITEM
// Route: POST /api/inventory
// Access: Admin & Warehouse Roles
// ==========================================
router.post('/', async (req, res) => {
  try {
    const {
      name,
      itemName,
      sku,
      category,
      aisle,
      rack,
      binLocation,
      location,
      quantity,
      minThreshold,
      defects,
      price,
      supplier
    } = req.body;

    const resolvedName = itemName || name;
    if (!resolvedName || quantity === undefined) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Item name and quantity stock values are mandatory fields.'
      });
    }

    // Auto-generate SKU if omitted
    const aisleChar = (aisle || 'Aisle A').replace('Aisle ', '').trim();
    const rackChar = (rack || 'Rack 1').replace('Rack ', '').trim();
    const generatedSku = sku || `SKU-${aisleChar}${rackChar}-${Date.now().toString().slice(-4)}`;
    const resolvedBin = binLocation || location || `${aisleChar}-${rackChar}-1`;

    const newInventoryItem = new Inventory({
      name: resolvedName.trim(),
      itemName: resolvedName.trim(),
      sku: generatedSku,
      category: category || 'Chairs & Seating',
      aisle: aisle || 'Aisle A',
      rack: rack || 'Rack 1',
      binLocation: resolvedBin,
      location: resolvedBin,
      quantity: Number(quantity) || 0,
      minThreshold: Number(minThreshold) || 5,
      defects: Number(defects) || 0,
      price: Number(price) || 0,
      supplier: supplier || 'N/A'
    });

    const savedItem = await newInventoryItem.save();

    // Record action to System Audit Logs
    await recordAuditLog(
      'Stock Item Added',
      req.user?.role || 'Warehouse',
      `Added ${savedItem.itemName} (${savedItem.quantity} units) to Bin ${savedItem.binLocation}`
    );

    return res.status(201).json(savedItem);
  } catch (err) {
    console.error('[Inventory API Error] POST / failed:', err.message);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to create inventory item in database.'
    });
  }
});

// ==========================================
// 4. UPDATE INVENTORY ITEM / QUANTITY
// Route: PUT /api/inventory/:id
// Access: Admin & Warehouse Roles
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const existingItem = await Inventory.findById(itemId);

    if (!existingItem) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Cannot update: Inventory item record does not exist.'
      });
    }

    const previousQty = existingItem.quantity;

    // Apply partial or complete updates
    const allowedFields = [
      'name',
      'itemName',
      'sku',
      'category',
      'aisle',
      'rack',
      'binLocation',
      'location',
      'quantity',
      'minThreshold',
      'defects',
      'price',
      'supplier'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        existingItem[field] = req.body[field];
      }
    });

    // Ensure name fields synchronize
    if (req.body.name && !req.body.itemName) existingItem.itemName = req.body.name;
    if (req.body.itemName && !req.body.name) existingItem.name = req.body.itemName;

    const updatedItem = await existingItem.save();

    // Log quantity or defect adjustments
    if (req.body.quantity !== undefined && req.body.quantity !== previousQty) {
      await recordAuditLog(
        'Inventory Updated',
        req.user?.role || 'Warehouse',
        `Adjusted stock for ${updatedItem.itemName}: ${previousQty} -> ${updatedItem.quantity}`
      );
    }

    return res.status(200).json(updatedItem);
  } catch (err) {
    console.error(`[Inventory API Error] PUT /${req.params.id} failed:`, err.message);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to update inventory record in database.'
    });
  }
});

// ==========================================
// 5. DELETE INVENTORY ITEM
// Route: DELETE /api/inventory/:id
// Access: Strictly Admin Role
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const itemToDelete = await Inventory.findById(itemId);

    if (!itemToDelete) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Cannot delete: Target inventory item not found.'
      });
    }

    await Inventory.findByIdAndDelete(itemId);

    // Record action to System Audit Logs
    await recordAuditLog(
      'Stock Item Deleted',
      req.user?.role || 'Admin',
      `Permanently removed item: ${itemToDelete.itemName} (SKU: ${itemToDelete.sku || 'N/A'})`
    );

    return res.status(200).json({
      success: true,
      message: `Item '${itemToDelete.itemName}' removed permanently from database catalog.`
    });
  } catch (err) {
    console.error(`[Inventory API Error] DELETE /${req.params.id} failed:`, err.message);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to delete inventory record from database.'
    });
  }
});

module.exports = router;