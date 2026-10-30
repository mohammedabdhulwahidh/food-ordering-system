import React from "react";
import { useEffect, useMemo, useState, createContext, useContext } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import api from "./api";

const AppContext = createContext(null);
const money = n => `₹${Number(n || 0).toFixed(2)}`;
const fallbackImage = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=700";

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };
  const add = food => setCart(old => {
    const found = old.find(x => x._id === food._id);
    return found ? old.map(x => x._id === food._id ? { ...x, quantity: x.quantity + 1 } : x) : [...old, { ...food, quantity: 1 }];
  });
  const change = (id, delta) => setCart(old => old.map(x => x._id === id ? { ...x, quantity: x.quantity + delta } : x).filter(x => x.quantity > 0));
  const value = { user, setUser, logout, cart, setCart, add, change };
  return <AppContext.Provider value={value}>
    <Navbar />
    <main className="container"><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/admin" element={user?.role === "admin" ? <Admin /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes></main>
    <footer>© 2026 QuickBite · Fresh food, delivered with care.</footer>
  </AppContext.Provider>;
}

function Navbar() {
  const { user, logout, cart } = useContext(AppContext);
  return <header className="nav"><Link className="brand" to="/">🍴 QuickBite</Link><nav>
    <Link to="/">Home</Link><Link to="/menu">Menu</Link>
    {user && <Link to="/orders">My Orders</Link>}
    {user?.role === "admin" && <Link to="/admin">Admin</Link>}
    <Link to="/cart">Cart ({cart.reduce((s,x)=>s+x.quantity,0)})</Link>
    {user ? <button className="navbutton" onClick={logout}>Logout</button> : <><Link to="/login">Login</Link><Link className="navcta" to="/register">Sign up</Link></>}
  </nav></header>;
}

function Home() {
  return <section className="hero">
    <div><span className="eyebrow">GOOD FOOD · GOOD MOOD</span><h1>Your cravings,<br/><em>delivered.</em></h1>
    <p>Discover delicious meals from our menu and get your favourites delivered fresh.</p>
    <Link className="primary" to="/menu">Explore Menu →</Link>
    <div className="hero-stats"><span><b>Fresh</b><small>Every order</small></span><span><b>Easy</b><small>Online ordering</small></span><span><b>Fast</b><small>Order updates</small></span></div></div>
    <div className="hero-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1100" alt="Delicious meal"/></div>
  </section>;
}

function Menu() {
  const [foods, setFoods] = useState([]), [search, setSearch] = useState(""), [category, setCategory] = useState("All"), [error, setError] = useState("");
  const { add } = useContext(AppContext);
  useEffect(() => { api.get("/foods").then(r=>setFoods(r.data)).catch(()=>setError("Could not load menu. Make sure the backend and MongoDB are running.")); }, []);
  const categories = ["All", ...new Set(foods.map(f=>f.category))];
  const shown = foods.filter(f => (category === "All" || f.category === category) && f.name.toLowerCase().includes(search.toLowerCase()));
  return <section className="section"><div className="section-head"><div><span className="eyebrow">MADE FRESH FOR YOU</span><h2>Explore our menu</h2><p>Choose your favourite dishes.</p></div><input className="search" placeholder="Search food..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
    <div className="filters">{categories.map(c=><button key={c} className={category===c?"filter active":"filter"} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    {error && <p className="error">{error}</p>}
    <div className="food-grid">{shown.map(food=><FoodCard key={food._id} food={food} onAdd={()=>add(food)}/>)}</div>
    {!shown.length && !error && <p className="empty">No food items found. Run the seed command or add food as admin.</p>}
  </section>;
}

function FoodCard({ food, onAdd }) {
  return <article className="food-card"><img src={food.image || fallbackImage} onError={e=>e.currentTarget.src=fallbackImage} alt={food.name}/><div className="food-info"><span className="tag">{food.category}</span><h3>{food.name}</h3><p>{food.description}</p><div className="food-bottom"><b>{money(food.price)}</b><button className="add" onClick={onAdd}>+ Add</button></div></div></article>;
}

function Auth({ mode }) {
  const register = mode === "register", [form,setForm] = useState({name:"",email:"",password:""}), [error,setError] = useState("");
  const { setUser } = useContext(AppContext); const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault(); setError("");
    try {
      const { data } = await api.post(`/auth/${register?"register":"login"}`, form);
      localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user); navigate(data.user.role === "admin" ? "/admin" : "/menu");
    } catch(err) { setError(err.response?.data?.message || "Unable to continue. Check the backend."); }
  };
  return <section className="auth-wrap"><form className="panel auth" onSubmit={submit}><span className="eyebrow">QUICKBITE ACCOUNT</span><h2>{register?"Create account":"Welcome back"}</h2><p>{register?"Join us and order your favourites.":"Log in to continue ordering."}</p>
    {register && <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}
    <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
    <label>Password<input required type="password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
    {error && <p className="error">{error}</p>}<button className="primary full">{register?"Create account":"Login"}</button>
    <p className="switch">{register?"Already registered?":"New customer?"} <Link to={register?"/login":"/register"}>{register?"Login":"Create an account"}</Link></p>
  </form></section>;
}

function Cart() {
  const { cart, change, setCart, user } = useContext(AppContext);
  const [address,setAddress] = useState(""), [message,setMessage] = useState("");
  const navigate = useNavigate();
  const total = cart.reduce((s,x)=>s+x.price*x.quantity,0);
  const placeOrder = async () => {
    if (!user) return navigate("/login");
    try {
      await api.post("/orders", { items: cart.map(x=>({foodId:x._id,quantity:x.quantity})), deliveryAddress:address });
      setCart([]); setMessage("Order placed successfully! View it in My Orders.");
    } catch(err) { setMessage(err.response?.data?.message || "Could not place order."); }
  };
  return <section className="section"><span className="eyebrow">YOUR SELECTION</span><h2>Shopping cart</h2>
    {!cart.length ? <div className="panel empty">Your cart is empty. <Link to="/menu">Browse the menu →</Link></div> :
    <div className="cart-layout"><div className="panel">{cart.map(x=><div className="cart-row" key={x._id}><img src={x.image||fallbackImage} alt=""/><div className="cart-name"><b>{x.name}</b><small>{money(x.price)} each</small></div><div className="qty"><button onClick={()=>change(x._id,-1)}>−</button><b>{x.quantity}</b><button onClick={()=>change(x._id,1)}>+</button></div><b>{money(x.price*x.quantity)}</b></div>)}</div>
      <div className="panel summary"><h3>Order summary</h3><div className="total"><span>Total</span><b>{money(total)}</b></div><label>Delivery address<textarea rows="3" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Enter your full delivery address"/></label><button className="primary full" disabled={!address.trim()} onClick={placeOrder}>Place order</button></div></div>}
    {message && <p className="notice">{message}</p>}
  </section>;
}

function Orders() {
  const [orders,setOrders] = useState([]), [error,setError] = useState("");
  useEffect(()=>{api.get("/orders/mine").then(r=>setOrders(r.data)).catch(e=>setError(e.response?.data?.message||"Please log in to view orders."));},[]);
  return <section className="section"><span className="eyebrow">ORDER HISTORY</span><h2>My orders</h2>{error&&<p className="error">{error}</p>}
    {orders.map(o=><article className="panel order" key={o._id}><div><b>Order #{o._id.slice(-6).toUpperCase()}</b><small>{new Date(o.createdAt).toLocaleString()}</small></div><span className="status">{o.status}</span><b>{money(o.totalAmount)}</b><p>{o.items.map(i=>`${i.name} × ${i.quantity}`).join(", ")}</p><small>Delivery: {o.deliveryAddress}</small></article>)}
    {!orders.length&&!error&&<p className="empty">No orders yet.</p>}
  </section>;
}

function Admin() {
  const empty = {name:"",description:"",price:"",category:"Biryani",image:"",available:true};
  const [form,setForm] = useState(empty), [foods,setFoods] = useState([]), [orders,setOrders] = useState([]), [editing,setEditing] = useState(null), [message,setMessage] = useState("");
  const load = async()=>{const [f,o]=await Promise.all([api.get("/foods/admin/all"),api.get("/orders")]);setFoods(f.data);setOrders(o.data);};
  useEffect(()=>{load().catch(e=>setMessage(e.response?.data?.message||"Unable to load admin data."));},[]);
  const save = async e => {
    e.preventDefault(); setMessage("");
    try {
      const payload={...form,price:Number(form.price)};
      if(editing) await api.put(`/foods/${editing}`,payload); else await api.post("/foods",payload);
      setForm(empty);setEditing(null);await load();setMessage("Food item saved.");
    } catch(e) {setMessage(e.response?.data?.message||"Could not save item.");}
  };
  const edit = f => {setEditing(f._id);setForm({name:f.name,description:f.description,price:f.price,category:f.category,image:f.image,available:f.available});window.scrollTo({top:0,behavior:"smooth"});};
  const remove = async id => {if(!window.confirm("Delete this food item?"))return;try{await api.delete(`/foods/${id}`);await load();setMessage("Food item deleted.");}catch(e){setMessage(e.response?.data?.message||"Delete failed.");}};
  const status = async (id,value)=>{try{await api.patch(`/orders/${id}/status`,{status:value});await load();}catch(e){setMessage(e.response?.data?.message||"Status update failed.");}};
  return <section className="section"><span className="eyebrow">MANAGEMENT</span><h2>Admin dashboard</h2>{message&&<p className="notice">{message}</p>}
    <div className="admin-grid"><form className="panel admin-form" onSubmit={save}><h3>{editing?"Update food item":"Add food item"}</h3>
      <label>Food name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <label>Price (₹)<input required type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
      <label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label>
      <label>Image URL<input value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/></label>
      <div className="form-actions"><button className="primary">{editing?"Update item":"Add item"}</button>{editing&&<button type="button" className="secondary" onClick={()=>{setEditing(null);setForm(empty);}}>Cancel</button>}</div>
    </form><div className="panel"><h3>Food items ({foods.length})</h3>{foods.map(f=><div className="admin-row" key={f._id}><div><b>{f.name}</b><small>{money(f.price)} · {f.category}</small></div><button className="smallbtn" onClick={()=>edit(f)}>Edit</button><button className="smallbtn danger" onClick={()=>remove(f._id)}>Delete</button></div>)}</div></div>
    <h2 className="subheading">Customer orders ({orders.length})</h2>{orders.map(o=><div className="panel order" key={o._id}><div><b>{o.customerName}</b><small>{o.items.map(i=>`${i.name} × ${i.quantity}`).join(", ")}</small></div><b>{money(o.totalAmount)}</b><select value={o.status} onChange={e=>status(o._id,e.target.value)}>{["Pending","Preparing","Out for delivery","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}
  </section>;
}

export default App;
