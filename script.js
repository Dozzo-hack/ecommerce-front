// ==========================
// CONFIG
// ==========================
const API_URL = "http://localhost:5000/api";
const UPLOADS_URL = "http://localhost:5000/uploads";
const WHATSAPP_NUMBER = "237640483676";

// ==========================
// DOM
// ==========================
const productGrid = document.getElementById("productGrid");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const categoryBar = document.getElementById("categoryBar");

const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const clearCart = document.getElementById("clearCart");
const checkoutBtn = document.getElementById("checkoutBtn");

const adminLink = document.getElementById("adminLink");
const loginLink = document.getElementById("loginLink");

// MODAL PRODUIT
const productModal = document.getElementById("productModal");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalAddCart = document.getElementById("modalAddCart");
const closeModal = document.getElementById("closeModal");

// ==========================
// STATE
// ==========================
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentCategory = "";
let currentSearch = "";
let loading = false;

// ==========================
// UTILS
// ==========================
const escapeHtml = (s="") =>
  s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// ==========================
// LOAD CATEGORIES
// ==========================
async function loadCategories() {
  const res = await fetch(`${API_URL}/categories`);
  const cats = await res.json();

  categoryFilter.innerHTML = `<option value="">Toutes catégories</option>`;
  categoryBar.innerHTML = `<button data-id="">Tous</button>`;

  cats.forEach(c => {
    categoryFilter.innerHTML += `<option value="${c._id}">${c.name}</option>`;
    categoryBar.innerHTML += `<button data-id="${c._id}">${c.name}</button>`;
  });
}

// ==========================
// LOAD PRODUCTS (FILTER OK)
// ==========================
async function loadProducts() {
  if (loading) return;
  loading = true;
  loader.style.display = "block";
  productGrid.innerHTML = "";

  const params = new URLSearchParams({
    category: currentCategory,
    search: currentSearch
  });

  const res = await fetch(`${API_URL}/products?${params}`);
  const data = await res.json();
  products = data;

  if (!data.length) {
    productGrid.innerHTML = "<p>Aucun produit trouvé</p>";
  }

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${UPLOADS_URL}/${p.image}">
      <h4>${escapeHtml(p.name)}</h4>
      <p>${Number(p.price).toLocaleString()} FCFA</p>
      <button class="detail" data-id="${p._id}">Voir détails</button>
      <button class="add" data-id="${p._id}">Ajouter au panier</button>
    `;
    productGrid.appendChild(card);
  });

  loader.style.display = "none";
  loading = false;
}

// ==========================
// EVENTS FILTERS
// ==========================
categoryFilter.addEventListener("change", e => {
  currentCategory = e.target.value;
  loadProducts();
});

categoryBar.addEventListener("click", e => {
  if (e.target.tagName !== "BUTTON") return;
  currentCategory = e.target.dataset.id;
  categoryFilter.value = currentCategory;
  loadProducts();
});

searchInput.addEventListener("input", e => {
  currentSearch = e.target.value.trim();
  loadProducts();
});

// ==========================
// PRODUCT ACTIONS
// ==========================
productGrid.addEventListener("click", e => {
  const id = e.target.dataset.id;
  const product = products.find(p => p._id === id);
  if (!product) return;

  if (e.target.classList.contains("detail")) {
    modalImg.src = `${UPLOADS_URL}/${product.image}`;
    modalName.textContent = product.name;
    modalDesc.textContent = product.description || "";
    modalPrice.textContent = `${product.price} FCFA`;
    modalAddCart.onclick = () => addToCart(product);
    productModal.classList.remove("hidden");
  }

  if (e.target.classList.contains("add")) {
    addToCart(product);
  }
});

closeModal.onclick = () => productModal.classList.add("hidden");

// ==========================
// CART
// ==========================
function addToCart(p) {
  cart.push(p);
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((p, i) => {
    total += Number(p.price);
    cartItems.innerHTML += `
      <div>
        ${p.name} - ${p.price} FCFA
        <button onclick="removeFromCart(${i})">✕</button>
      </div>
    `;
  });

  cartTotal.textContent = total.toLocaleString();
  cartCount.textContent = cart.length;
  localStorage.setItem("cart", JSON.stringify(cart));
}

window.removeFromCart = i => {
  cart.splice(i, 1);
  updateCart();
};

cartBtn.onclick = () => cartModal.classList.remove("hidden");
closeCart.onclick = () => cartModal.classList.add("hidden");
clearCart.onclick = () => { cart = []; updateCart(); };

// ==========================
// WHATSAPP
// ==========================
checkoutBtn.onclick = () => {
  if (!cart.length) return alert("Panier vide");
  const text = encodeURIComponent(
    cart.map(p => `• ${p.name} - ${p.price} FCFA`).join("\n")
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
};

// ==========================
// USER UI
// ==========================
function checkUser() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    loginLink.textContent = "Connexion / Inscription";
    loginLink.href = "login.html";
    adminLink.classList.add("hidden");
    return;
  }

  // Affichage utilisateur connecté
  loginLink.textContent = `Déconnexion (${user.name})`;
  loginLink.href = "#";

  loginLink.onclick = (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.reload();
  };

  // Admin uniquement
  if (user.role === "admin") {
    adminLink.classList.remove("hidden");
  } else {
    adminLink.classList.add("hidden");
  }
}


// ==========================
// INIT
// ==========================
updateCart();
loadCategories();
loadProducts();
checkUser();