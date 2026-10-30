const router = require("express").Router();
const Order = require("../models/Order");
const Food = require("../models/Food");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0 || !deliveryAddress?.trim()) {
      return res.status(400).json({ message: "Cart items and delivery address are required" });
    }
    const orderItems = [];
    for (const item of items) {
      const food = await Food.findById(item.foodId);
      const quantity = Number(item.quantity);
      if (!food || !food.available || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "One or more cart items are invalid" });
      }
      orderItems.push({ food: food._id, name: food.name, price: food.price, quantity });
    }
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      customer: req.user._id, customerName: req.user.name,
      items: orderItems, totalAmount, deliveryAddress
    });
    res.status(201).json(order);
  } catch (err) { next(err); }
});

router.get("/mine", protect, async (req, res, next) => {
  try { res.json(await Order.find({ customer: req.user._id }).sort({ createdAt: -1 })); } catch (err) { next(err); }
});

router.get("/", protect, adminOnly, async (req, res, next) => {
  try { res.json(await Order.find().populate("customer", "name email").sort({ createdAt: -1 })); } catch (err) { next(err); }
});

router.patch("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ["Pending", "Preparing", "Out for delivery", "Delivered", "Cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) { next(err); }
});

module.exports = router;
