const API_BASE = "https://ecommerce-backend-q5ld.onrender.com/api";
const productForm = document.getElementById("productForm");
const categoryForm = document.getElementById("categoryForm");
const categorySelect = document.getElementById("productCategory");
const categoryList = document.getElementById("categoryList");
const productList = document.getElementById("productList");

function getAuthHeader() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    categorySelect.innerHTML = "<option value=''>--Choisir--</option>";
    categoryList.innerHTML = "";
    data.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat._id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cat.name}</td>
        <td>${new Date(cat.createdAt).toLocaleDateString()}</td>
        <td><button data-id="${cat._id}" class="delete-cat">🗑️</button></td>
      `;
      categoryList.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur loadCategories:", err);
    alert("Erreur de chargement des catégories");
  }
}

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    productList.innerHTML = "";
    data.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${Number(p.price).toLocaleString()}</td>
        <td>${p.category?.name || "—"}</td>
         <td>${p.image ? `<img src="https://ecommerce-backend-q5ld.onrender.com/uploads/${p.image}" alt="${p.name}" width="80"/>` : "—"}</td>
        <td><button data-id="${p._id}" class="delete-product">🗑️</button></td>
      `;
      productList.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur loadProducts:", err);
    alert("Erreur de chargement des produits");
  }
}

// ajouter catégorie
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDescription").value.trim();
  if (!name) return alert("Nom requis");

  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      },
      body: JSON.stringify({ name, description })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur ajout catégorie");
    categoryForm.reset();
    await loadCategories();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erreur lors de l'ajout de catégorie");
  }
});

// supprimer catégorie (délégué)
categoryList.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-cat")) return;
  const id = e.target.dataset.id;
  if (!confirm("Supprimer cette catégorie ?")) return;
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Erreur suppression");
    }
    loadCategories();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erreur suppression catégorie");
  }
});

// ajouter produit (FormData pour l'image)
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("productName").value.trim();
  const description = document.getElementById("productDescription").value.trim();
  const price = document.getElementById("productPrice").value;
  const category = document.getElementById("productCategory").value;
  const file = document.getElementById("productImage").files[0];

  if (!name || !price || !category) return alert("Remplis les champs requis");

  try {
    const form = new FormData();
    form.append("name", name);
    form.append("description", description);
    form.append("price", price);
    form.append("category", category);
    if (file) form.append("image", file);

    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: getAuthHeader(), // ne pas mettre Content-Type => fetch gère FormData boundary
      body: form
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur ajout produit");
    productForm.reset();
    loadProducts();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erreur lors de l'ajout de produit");
  }
});

// supprimer produit
productList.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-product")) return;
  const id = e.target.dataset.id;
  if (!confirm("Supprimer ce produit ?")) return;
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Erreur suppression produit");
    }
    loadProducts();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erreur suppression produit");
  }
});

// Init
(async function initAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Tu dois être connecté en tant qu'admin.");
    window.location.href = "login.html";
    return;
  }
  if (user.role !== "admin") {
    alert("Accès admin requis.");
    window.location.href = "index.html";
    return;
  }
  await loadCategories();
  await loadProducts();
})();



