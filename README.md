# Food Ordering System (MERN)

A practical-exam starter project using MongoDB, Express.js, React.js and Node.js.

## Features
- Customer registration and login (bcrypt password hashing + JWT)
- Food menu loaded from MongoDB
- Search and category filters
- Cart with quantity controls
- Place orders and view order history
- Admin dashboard: create, read, update and delete food items; view orders and update order status
- Seed script to add sample food items

## Requirements
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- VS Code (recommended)

## 1. Configure the backend
Open a terminal:
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and fill in your MongoDB connection string and a long JWT secret.
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=replace_this_with_a_long_random_secret
PORT=5000
```
Create an admin user by registering normally, then change that user's `role` to `admin` in MongoDB Atlas (Users collection). This keeps the project simple for a practical demonstration.

Add sample food:
```bash
npm run seed
```
Start backend:
```bash
npm run dev
```
API runs at http://localhost:5000

## 2. Start the React frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Demo flow
1. Register a customer account.
2. Log in and browse the menu.
3. Add food to cart and place an order.
4. Log in using an account whose MongoDB `role` is `admin`.
5. Open Admin, add/edit/delete food and update order status.

## Important
- Do not commit your `.env` file or share your database password.
- This is an educational project. For production, add stronger validation, rate limiting, payment-provider integration, and more robust admin provisioning.
