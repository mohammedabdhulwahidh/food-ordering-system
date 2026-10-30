require("dotenv").config();
const mongoose = require("mongoose");
const Food = require("./models/Food");

const sampleFoods = [
  { name: "Chicken Biryani", description: "Aromatic rice with spiced chicken.", price: 160, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=700" },
  { name: "Veg Biryani", description: "Flavourful basmati rice and vegetables.", price: 120, category: "Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700" },
  { name: "Chicken Burger", description: "Crispy chicken patty with fresh vegetables.", price: 130, category: "Fast Food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700" },
  { name: "Margherita Pizza", description: "Classic cheese and tomato pizza.", price: 180, category: "Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=700" },
  { name: "French Fries", description: "Golden crispy potato fries.", price: 80, category: "Snacks", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700" },
  { name: "Chocolate Milkshake", description: "Chilled chocolate milkshake.", price: 90, category: "Drinks", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=700" }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const food of sampleFoods) {
    await Food.updateOne({ name: food.name }, { $set: food }, { upsert: true });
  }
  console.log("Sample food items added/updated.");
  await mongoose.disconnect();
}
seed().catch(err => { console.error(err); process.exit(1); });
