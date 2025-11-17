// ------------------------ SAMPLE DATA ------------------------
const sampleProducts = [
  {
    id:'g1', type:'game', title:'Astral Odyssey',
    developer:'Nebula Forge', platform:['PC','Steam'],
    desc:'Космическая RPG с открытым миром.',
    price:29.99, oldPrice:49.99, discount:40, rating:4.6,
    thumb:'img/price1.jpg'
  },
  {
    id:'g2', type:'game', title:'Cyber Rally 2049',
    developer:'VectorArc', platform:['PC','Epic'],
    desc:'Футуристические гонки.',
    price:19.99, discount:0, rating:4.2,
    thumb:'img/price2.jpg'
  },
  {
    id:'i1', type:'item', title:'Dota 2',
    developer:'BG Market', platform:['PC','Steam'],
    desc:'Редкий огненный меч.',
    price:9.99, oldPrice:14.99, discount:33, rating:4.8,
    thumb:'img/price3.png'
  }
];

let products = [...sampleProducts];

let filters = {
  categories:new Set(),
  platforms:new Set(),
  maxPrice:100,
  onlyDiscount:false,
  query:'',
  sortBy:'relevance',
  perPage:3,
  shown:6
};

let cart = JSON.parse(localStorage.getItem("cart") || "{}");

// ------------------------ ELEMENTS ------------------------
const catalogEl = document.getElementById("catalog");
const categoryListEl = document.getElementById("categoryList");
const platformListEl = document.getElementById("platformList");
const globalSearchEl = document.getElementById("globalSearch");
const priceRangeEl = document.getElementById("priceRange");
const priceValEl = document.getElementById("priceVal");
const onlyDiscountEl = document.getElementById("onlyDiscount");
const resultCountEl = document.getElementById("resultCount");
const shownCountEl = document.getElementById("shownCount");
const sortByEl = document.getElementById("sortBy");
const perPageEl = document.getElementById("perPage");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const clearBtn = document.getElementById("clearBtn");
const applyBtn = document.getElementById("applyBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

// modal
const modal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalCarousel = document.getElementById("modalCarousel");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalOldPrice = document.getElementById("modalOldPrice");
const modalRating = document.getElementById("modalRating");
const modalTagline = document.getElementById("modalTagline");
const modalQty = document.getElementById("modalQty");
const addToCartBtn = document.getElementById("addToCartBtn");
const buyNowBtn = document.getElementById("buyNowBtn");

// cart drawer
const toggleCartBtn = document.getElementById("toggleCartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartListEl = document.getElementById("cartList");
const cartTotalEl = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const closeCartBtn = document.getElementById("closeCartBtn");

// ------------------------ FILTER OPTIONS ------------------------
function renderFilterOptions(){
  categoryListEl.innerHTML = `
    <label><input type="checkbox" data-cat="game"/> Игры</label>
    <label><input type="checkbox" data-cat="item"/> Предметы</label>
  `;

  platformListEl.innerHTML = `
    <label><input type="checkbox" data-platform="PC"> PC</label>
    <label><input type="checkbox" data-platform="Steam"> Steam</label>
    <label><input type="checkbox" data-platform="Epic"> Epic</label>
  `;
}

// ------------------------ RENDER CATALOG ------------------------
function applyFiltersAndRender(){
  let out = products.filter(p=>{
    if(filters.categories.size && !filters.categories.has(p.type)) return false;
    if(filters.platforms.size && !p.platform.some(pl=>filters.platforms.has(pl))) return false;
    if(filters.onlyDiscount && p.discount === 0) return false;
    if(p.price > filters.maxPrice) return false;

    if(filters.query){
      const q = filters.query.toLowerCase();
      if(!p.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  switch(filters.sortBy){
    case "price-asc": out.sort((a,b)=>a.price-b.price); break;
    case "price-desc": out.sort((a,b)=>b.price-a.price); break;
    case "discount": out.sort((a,b)=>b.discount-a.discount); break;
    case "rating": out.sort((a,b)=>b.rating-a.rating); break;
  }

  resultCountEl.textContent = out.length;
  catalogEl.style.gridTemplateColumns = `repeat(${filters.perPage},1fr)`;

  catalogEl.innerHTML = "";
  out.slice(0,filters.shown).forEach(p=>{
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="thumb" style="background-image:url('${p.thumb}')"></div>
      <div>
        <div class="title">${p.title}</div>
        <div class="muted">${p.developer}</div>
        <div class="price">${p.price}$</div>
        <button class="btn ghost viewBtn" data-id="${p.id}">Подробнее</button>
        <button class="btn addBtn" data-id="${p.id}">В корзину</button>
      </div>
    `;
    catalogEl.appendChild(el);
  });

  shownCountEl.textContent = Math.min(filters.shown,out.length);
}

// ------------------------ CART ------------------------
function renderCart(){
  cartListEl.innerHTML = "";

  let total = 0;
  Object.entries(cart).forEach(([id,qty])=>{
    const p = products.find(x=>x.id===id);
    total += p.price * qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div style="width:50px;height:40px;background-size:cover;border-radius:6px;background-image:url('${p.thumb}')"></div>
      <div style="flex:1">${p.title} × ${qty}</div>
      <div>${(p.price*qty).toFixed(2)}$</div>
    `;
    cartListEl.appendChild(row);
  });

  cartTotalEl.textContent = total.toFixed(2) + "$";
  toggleCartBtn.textContent = `Корзина (${Object.keys(cart).length})`;
}

function addToCart(id, qty=1){
  cart[id] = (cart[id]||0) + qty;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function buyNow(id, qty=1){
  cart = {};
  cart[id] = qty;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ------------------------ MODAL ------------------------
function openModal(id){
  const p = products.find(x=>x.id===id);

  modalTitle.textContent = p.title;
  modalSubtitle.textContent = p.developer;
  modalCarousel.style.backgroundImage = `url('${p.thumb}')`;
  modalDesc.textContent = p.desc;
  modalPrice.textContent = p.price + "$";
  modalOldPrice.textContent = p.oldPrice ? p.oldPrice+"$" : "";
  modalRating.textContent = p.rating;
  modalTagline.textContent = p.type === "game" ? "Игра" : "Предмет";

  addToCartBtn.dataset.id = id;
  buyNowBtn.dataset.id = id;

  modal.style.display = "flex";
}

function closeModal(){
  modal.style.display = "none";
}

// ------------------------ EVENTS ------------------------
document.addEventListener("click", e=>{
  if(e.target.classList.contains("addBtn"))
    addToCart(e.target.dataset.id);

  if(e.target.classList.contains("viewBtn"))
    openModal(e.target.dataset.id);
});

closeModalBtn.onclick = closeModal;
modal.onclick = e=>{ if(e.target===modal) closeModal(); };

addToCartBtn.onclick = ()=> addToCart(addToCartBtn.dataset.id, Number(modalQty.value));
buyNowBtn.onclick = ()=> buyNow(buyNowBtn.dataset.id, Number(modalQty.value));

// cart drawer
toggleCartBtn.onclick = ()=>{
  cartDrawer.style.display = cartDrawer.style.display==="block"?"none":"block";
};
closeCartBtn.onclick = ()=> cartDrawer.style.display="none";
clearCartBtn.onclick = ()=>{
  cart = {};
  localStorage.setItem("cart","{}");
  renderCart();
};
checkoutBtn.onclick = ()=> alert("Заказ оформлен (демо)");

// filters
categoryListEl.onchange = e=>{
  const cat = e.target.dataset.cat;
  if(cat){
    if(e.target.checked) filters.categories.add(cat);
    else filters.categories.delete(cat);
    applyFiltersAndRender();
  }
};
platformListEl.onchange = e=>{
  const pl = e.target.dataset.platform;
  if(pl){
    if(e.target.checked) filters.platforms.add(pl);
    else filters.platforms.delete(pl);
    applyFiltersAndRender();
  }
};

globalSearchEl.oninput = ()=>{
  filters.query = globalSearchEl.value;
  applyFiltersAndRender();
};

priceRangeEl.oninput = ()=>{
  filters.maxPrice = Number(priceRangeEl.value);
  priceValEl.textContent = filters.maxPrice + "$";
};

onlyDiscountEl.onchange = ()=>{
  filters.onlyDiscount = onlyDiscountEl.checked;
  applyFiltersAndRender();
};

sortByEl.onchange = ()=>{
  filters.sortBy = sortByEl.value;
  applyFiltersAndRender();
};

perPageEl.onchange = ()=>{
  filters.perPage = Number(perPageEl.value);
  applyFiltersAndRender();
};

loadMoreBtn.onclick = ()=>{
  filters.shown += 6;
  applyFiltersAndRender();
};

clearBtn.onclick = ()=>{
  filters = {
    categories:new Set(),
    platforms:new Set(),
    maxPrice:100,
    onlyDiscount:false,
    query:'',
    sortBy:'relevance',
    perPage:3,
    shown:6
  };
  globalSearchEl.value = "";
  priceRangeEl.value = 100;
  onlyDiscountEl.checked = false;
  renderFilterOptions();
  applyFiltersAndRender();
};

applyBtn.onclick = ()=> applyFiltersAndRender();
clearFiltersBtn.onclick = ()=> clearBtn.onclick();

// ------------------------ INIT ------------------------
renderFilterOptions();
applyFiltersAndRender();
renderCart();
