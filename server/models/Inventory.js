const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    // Ito ang idinagdag para maayos ang E11000 null duplicate error
    itemCode: {
      type: String,
      unique: true,
      required: true
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    price: {
      type: Number,
      required: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    // WBS 3.3.4: Physical Warehouse Location Fields
    aisle: {
      type: String,
      default: 'A' // e.g., Aisle A, B, C, D
    },
    rack: {
      type: Number,
      default: 1 // Rack 1 to 4
    },
    shelf: {
      type: Number,
      default: 1 // Shelf 1 to 3
    },
    binCode: {
      type: String,
      default: 'A-1-1' // E.g., "A-1-1"
    },
    gridX: {
      type: Number,
      default: 0
    },
    gridY: {
      type: Number,
      default: 0
    },
    // WBS 3.3.3: Automated Warning & Quality Tracking
    reorderThreshold: {
      type: Number,
      default: 5
    },
    defectiveQuantity: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Inventory', InventorySchema);