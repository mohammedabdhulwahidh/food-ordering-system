const router = require("express").Router();
const Food = require("../models/Food");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res, next) => {
  try {
    const filter = { available: true };
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };
    res.json(await Food.find(filter).sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

router.get("/admin/all", protect, adminOnly, async (req, res, next) => {
  try { res.json(await Food.find().sort({ createdAt: -1 })); } catch (err) { next(err); }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    if (!name || price === undefined) return res.status(400).json({ message: "Food name and price are required" });
    res.status(201).json(await Food.create({ name, description, price, category, image, available }));
  } catch (err) { next(err); }
});

router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: "Food item not found" });
    res.json(food);
  } catch (err) { next(err); }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food item not found" });
    res.json({ message: "Food item deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
