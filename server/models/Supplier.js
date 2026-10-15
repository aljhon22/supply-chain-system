const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    contactPerson: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    status: {
  type: String,
  default: 'Active'
    }
  },
  { 
    timestamps: true 
  }
);

// Replace the last line of Supplier_2.js with this:
module.exports = mongoose.model('Supplier', SupplierSchema, 'suppliers'); 
// Change 'suppliers' to match your exact collection name in Atlas