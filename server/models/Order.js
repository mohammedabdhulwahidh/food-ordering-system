const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true },
  items: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Preparing", "Out for delivery", "Delivered", "Cancelled"], default: "Pending" },
  deliveryAddress: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
