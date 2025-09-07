// ---------- Data ----------
const PRODUCTS = [
  {
    id: "p-1",
    title: "Wireless Headphones",
    price: 2499,
    img: "https://cdn.mos.cms.futurecdn.net/H45dC94VsuD7CMszsoJro3.png",
  },
  {
    id: "p-2",
    title: "Smartwatch",
    price: 3599,
    img: "https://www.gonoise.com/cdn/shop/files/1_c95e5561-4f66-413d-b143-42d31821e554.webp?v=1721392308",
  },
  {
    id: "p-3",
    title: "Mechanical Keyboard",
    price: 4199,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p-4",
    title: "Action Camera",
    price: 5299,
    img: "https://djiindiashop.com/cdn/shop/files/5_fe8087a6-5f20-407e-b118-efcd7e1021ea.jpg?v=1726814803&width=1280",
  },
  {
    id: "p-5",
    title: "Bluetooth Speaker",
    price: 1899,
    img: "https://www.boat-lifestyle.com/cdn/shop/files/Stone_SpinXPro_1_b3503890-50f6-4cd1-9138-0bd90874391e_1300x.png?v=1709717442",
  },
  {
    id: "p-6",
    title: "Gaming Mouse",
    price: 1299,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9FQXsh-LzFKpGqaf_MgESYlA_VLtBQ7IT0A&s",
  },
  {
    id: "p-7",
    title: "Laptop Stand",
    price: 999,
    img: "https://alogic.in/cdn/shop/files/FLEXAdjustableLaptopStandwith5-in-14KUSB-CHub_1.webp?v=1720438437&width=2048",
  },
  {
    id: "p-8",
    title: "USB-C Hub",
    price: 1499,
    img: "https://rukminim2.flixcart.com/image/300/300/kyyqpow0/docking-station/b/v/f/1-12-in-1-4k-uhd-type-c-hub-usb3-0-hdmi-vga-pd-adapter-docking-original-imagb2xzfvhghdpq.jpeg",
  },
];

// ---------- Helpers ----------
const $ = (sel, el=document) => el.querySelector(sel);
const fmt = n => "₹" + n.toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2});

// ---------- State ----------
const STORAGE_KEY = "novastore_cart_v1";
const cart = new Map();

function loadCart(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const obj = JSON.parse(raw);
    Object.entries(obj).forEach(([id, qty])=> cart.set(id, qty));
  }catch(e){ console.warn("Failed to load cart", e); }
}
function saveCart(){
  const obj = {};
  for(const [id, qty] of cart.entries()) obj[id]=qty;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

// ---------- Render Products ----------
const productsEl = $("#products");
function renderProducts(list=PRODUCTS){
  productsEl.innerHTML = "";
  list.forEach(p=>{
    const inCart = cart.get(p.id) || 0;
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img class="cover" alt="${p.title}" src="${p.img}">
      <div class="content">
        <h3 class="title">${p.title}</h3>
        <div class="muted">Ships in 2–4 days</div>
        <div class="row">
          <span class="price">${fmt(p.price)}</span>
          <div class="actions"></div>
        </div>
      </div>
    `;
    const actions = card.querySelector(".actions");
    if(inCart>0){
      actions.appendChild(makeQtyControls(p.id, inCart));
    }else{
      const btn = document.createElement("button");
      btn.className = "btn accent";
      btn.textContent = "Add to Cart";
      btn.onclick = ()=> addToCart(p.id, 1);
      actions.appendChild(btn);
    }
    productsEl.appendChild(card);
  });
}

// ---------- Qty Controls ----------
function makeQtyControls(id, qty){
  const wrap = document.createElement("div");
  wrap.className = "qty";
  wrap.innerHTML = `
    <button aria-label="Decrease">−</button>
    <strong aria-live="polite">${qty}</strong>
    <button aria-label="Increase">+</button>
  `;
  const [dec, countEl, inc] = wrap.children;
  inc.onclick = ()=> changeQty(id, +1);
  dec.onclick = ()=> changeQty(id, -1);
  return wrap;
}

// ---------- Cart Logic ----------
function addToCart(id, amount=1){
  const newQty = (cart.get(id) || 0) + amount;
  cart.set(id, newQty);
  saveCart();
  syncUI();
}
function changeQty(id, delta){
  const cur = cart.get(id) || 0;
  const next = cur + delta;
  if(next <= 0){ cart.delete(id); }
  else { cart.set(id, next); }
  saveCart();
  syncUI();
}
function removeFromCart(id){
  cart.delete(id);
  saveCart();
  syncUI();
}
function clearCart(){
  cart.clear();
  saveCart();
  syncUI();
}

// ---------- Render Cart Drawer ----------
const cartList = $("#cartList");
const itemTotal = $("#itemTotal");
const grandTotal = $("#grandTotal");
function renderCart(){
  cartList.innerHTML = "";
  if(cart.size===0){
    cartList.innerHTML = `<div class="empty">Your cart is empty.</div>`;
    itemTotal.textContent = "0";
    grandTotal.textContent = fmt(0);
    return;
  }
  let totalItems=0, totalPrice=0;
  for(const [id, qty] of cart.entries()){
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) continue;
    totalItems += qty;
    totalPrice += p.price * qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div>
        <h4>${p.title}</h4>
        <div class="line">
          <span class="muted">${fmt(p.price)} each</span>
          <div class="qty">
            <button aria-label="Decrease">−</button>
            <strong aria-live="polite">${qty}</strong>
            <button aria-label="Increase">+</button>
          </div>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px">
        <strong>${fmt(p.price*qty)}</strong>
        <button class="remove" aria-label="Remove">Remove</button>
      </div>
    `;
    const qWrap = row.querySelector(".qty");
    const [dec, countEl, inc] = qWrap.children;
    inc.onclick = ()=> changeQty(id,+1);
    dec.onclick = ()=> changeQty(id,-1);
    row.querySelector(".remove").onclick = ()=> removeFromCart(id);
    cartList.appendChild(row);
  }
  itemTotal.textContent = String(totalItems);
  grandTotal.textContent = fmt(totalPrice);
}

// ---------- Search ----------
const search = $("#search");
const clearSearchBtn = $("#clearSearch");
function doSearch(){
  const q = search.value.trim().toLowerCase();
  if(!q){ renderProducts(PRODUCTS); return; }
  const filtered = PRODUCTS.filter(p => p.title.toLowerCase().includes(q));
  renderProducts(filtered);
}
search.addEventListener("input", doSearch);
clearSearchBtn.addEventListener("click", ()=>{ search.value = ""; doSearch(); });

// ---------- Drawer Toggle ----------
const drawer = $("#cartDrawer");
const openCartBtn = $("#openCart");
const closeCartBtn = $("#closeCart");
openCartBtn.onclick = ()=>{
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden","false");
};
closeCartBtn.onclick = ()=>{
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden","true");
};
$("#clearCart").onclick = clearCart;

// ---------- Sync UI ----------
const cartCount = $("#cartCount");

function syncUI() {
  renderProducts();
  renderCart();
  cartCount.textContent = String(
    [...cart.values()].reduce((a, b) => a + b, 0)
  );
}

// ---------- Init ----------
loadCart();
syncUI();
